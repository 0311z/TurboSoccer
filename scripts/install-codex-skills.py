#!/usr/bin/env python3
"""Install or verify this project's pinned Codex skills using only Python's stdlib."""

from __future__ import annotations

import argparse
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import sys
import tempfile
import urllib.request
import zipfile

PROJECT = Path(__file__).resolve().parents[1]
LOCK = PROJECT / "skills.lock.json"
DESTINATION = PROJECT / ".agents" / "skills"
MAX_DOWNLOAD = 64 * 1024 * 1024


def relative_path(value: str) -> PurePosixPath:
    path = PurePosixPath(value)
    if not value or path.is_absolute() or ".." in path.parts or "\\" in value:
        raise ValueError(f"Unsafe relative path: {value!r}")
    return path


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def tree_digest(files: list[dict]) -> str:
    text = "".join(f"{item['path']}\0{item['sha256']}\n" for item in files)
    return digest(text.encode("utf-8"))


def load_lock() -> dict:
    lock = json.loads(LOCK.read_text(encoding="utf-8"))
    source = lock["source"]
    if lock.get("schema_version") != 1:
        raise ValueError("Unsupported skills lock schema")
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", source["repository"]):
        raise ValueError("Invalid GitHub repository")
    if not re.fullmatch(r"[0-9a-f]{40}", source["commit"]):
        raise ValueError("Source must be pinned to a full Git commit SHA")
    names = set()
    for skill in lock["skills"]:
        name = relative_path(skill["name"])
        if len(name.parts) != 1 or str(name) in names:
            raise ValueError("Skill destination names must be unique single segments")
        names.add(str(name))
        relative_path(skill["path"])
        paths = []
        for item in skill["files"]:
            relative_path(item["path"])
            if not re.fullmatch(r"[0-9a-f]{64}", item["sha256"]):
                raise ValueError("Invalid file hash in skills lock")
            if not isinstance(item["bytes"], int) or item["bytes"] < 0:
                raise ValueError("Invalid file size in skills lock")
            paths.append(item["path"])
        if paths != sorted(set(paths)) or "SKILL.md" not in paths:
            raise ValueError("Skill files must be unique, sorted and include SKILL.md")
        if tree_digest(skill["files"]) != skill["tree_sha256"]:
            raise ValueError(f"Invalid tree hash: {skill['name']}")
    if len(names) != lock["skill_count"]:
        raise ValueError("Skill count does not match lock")
    if sum(len(s["files"]) for s in lock["skills"]) != lock["file_count"]:
        raise ValueError("File count does not match lock")
    return lock


def verify_file(data: bytes, item: dict, label: str) -> None:
    if len(data) != item["bytes"] or digest(data) != item["sha256"]:
        raise ValueError(f"Content does not match pinned hash: {label}")


def verify_install(root: Path, lock: dict) -> None:
    if root.is_symlink() or not root.is_dir():
        raise ValueError(f"Skills directory is missing or unsafe: {root}")
    actual_names = {item.name for item in root.iterdir()}
    if actual_names != {skill["name"] for skill in lock["skills"]}:
        raise ValueError("Installed skill directories differ from skills.lock.json")
    for skill in lock["skills"]:
        folder = root / skill["name"]
        if folder.is_symlink() or not folder.is_dir():
            raise ValueError(f"Unsafe skill directory: {skill['name']}")
        all_items = list(folder.rglob("*"))
        if any(item.is_symlink() for item in all_items):
            raise ValueError(f"Symlinks are not allowed: {skill['name']}")
        actual = {item.relative_to(folder).as_posix() for item in all_items if item.is_file()}
        if actual != {item["path"] for item in skill["files"]}:
            raise ValueError(f"Installed file list differs: {skill['name']}")
        for item in skill["files"]:
            verify_file((folder / item["path"]).read_bytes(), item, skill["name"] + "/" + item["path"])


def download_archive(lock: dict) -> zipfile.ZipFile:
    source = lock["source"]
    url = f"https://codeload.github.com/{source['repository']}/zip/{source['commit']}"
    request = urllib.request.Request(url, headers={"User-Agent": "TurboSoccer-skills-installer/1"})
    # This public download needs no credentials and never reads GitHub token variables.
    with urllib.request.urlopen(request, timeout=60) as response:
        payload = response.read(MAX_DOWNLOAD + 1)
    if len(payload) > MAX_DOWNLOAD:
        raise ValueError("Source archive exceeds the 64 MiB download limit")
    archive = zipfile.ZipFile(io.BytesIO(payload))
    for item in archive.infolist():
        relative_path(item.filename.rstrip("/"))
        if stat.S_ISLNK(item.external_attr >> 16):
            archive.close()
            raise ValueError("Source archive contains a symlink")
    return archive


def populate(staging: Path, lock: dict, source: Path | None) -> None:
    archive = None if source else download_archive(lock)
    try:
        prefix = None
        if archive:
            top_levels = {name.split("/", 1)[0] for name in archive.namelist()}
            if len(top_levels) != 1:
                raise ValueError("Unexpected source archive layout")
            prefix = next(iter(top_levels))
        for skill in lock["skills"]:
            for item in skill["files"]:
                source_path = skill["path"] + "/" + item["path"]
                if source:
                    local_file = source / source_path
                    if not local_file.resolve().is_relative_to(source.resolve()) or local_file.is_symlink():
                        raise ValueError(f"Unsafe local source: {source_path}")
                    data = local_file.read_bytes()
                else:
                    info = archive.getinfo(prefix + "/" + source_path)
                    if info.file_size != item["bytes"]:
                        raise ValueError(f"Archive file size differs: {source_path}")
                    data = archive.read(info)
                verify_file(data, item, source_path)
                target = staging / skill["name"] / item["path"]
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(data)
        verify_install(staging, lock)
    finally:
        if archive:
            archive.close()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify installed files without network access")
    parser.add_argument("--source", type=Path, help="Use a local upstream checkout; every copied file is hash-verified")
    args = parser.parse_args()
    try:
        lock = load_lock()
        if DESTINATION.parent.is_symlink() or DESTINATION.is_symlink():
            raise ValueError("The project skill destination may not be a symlink")
        if args.check or DESTINATION.exists():
            verify_install(DESTINATION, lock)
            print(f"Verified {lock['skill_count']} skills and {lock['file_count']} files at {DESTINATION}")
            return 0
        DESTINATION.parent.mkdir(parents=True, exist_ok=True)
        staging = Path(tempfile.mkdtemp(prefix=".skills-install-", dir=DESTINATION.parent))
        try:
            populate(staging, lock, args.source)
            staging.rename(DESTINATION)
        finally:
            if staging.exists():
                shutil.rmtree(staging)
        print(f"Installed {lock['skill_count']} pinned skills at {DESTINATION}")
        print("Restart Codex to pick up new skills.")
        return 0
    except (OSError, ValueError, KeyError, zipfile.BadZipFile) as exc:
        print(f"Skill installation failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
