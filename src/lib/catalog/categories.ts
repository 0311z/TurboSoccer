export const catalogCategories = [
  {slug:'car-body',name:'Car bodies',singular:'Car body',description:'The shape of your garage. Explore documented car bodies and their origins.'},
  {slug:'paint',name:'Paint',singular:'Paint',description:'Color your next build. Discover documented paint cosmetics when available.'},
  {slug:'decal',name:'Decals',singular:'Decal',description:'A different finish for every build. Explore documented Turbo Soccer decals.'},
  {slug:'sticker',name:'Stickers',singular:'Sticker',description:'The small details that make a build yours. Explore documented stickers.'},
  {slug:'wheels',name:'Wheels',singular:'Wheels',description:'Find the finishing touch for your ride. Browse documented wheel cosmetics.'},
  {slug:'boost-trail',name:'Boost trails',singular:'Boost trail',description:'Leave your mark on the pitch. Discover documented boost trail cosmetics.'},
  {slug:'topper',name:'Toppers',singular:'Topper',description:'A little personality on top. Browse hats and toppers documented by the community.'},
  {slug:'horn',name:'Horns',singular:'Horn',description:'Make your entrance heard. Explore documented Turbo Soccer horns.'},
  {slug:'license-plate',name:'License plates',singular:'License plate',description:'Make your ride recognizable. Explore documented cosmetic license plates.'},
  {slug:'ball-skin',name:'Ball skins',singular:'Ball skin',description:'A new look for the ball. Discover documented ball skin cosmetics when available.'},
  {slug:'demolition-effect',name:'Demolition effects',singular:'Demolition effect',description:'Make an impact in style. Discover documented demolition effect cosmetics.'},
  {slug:'goal-explosion',name:'Goal explosions',singular:'Goal explosion',description:'Celebrate your finish. Discover documented goal explosions and finishers.'},
  {slug:'emote',name:'Emotes',singular:'Emote',description:'Explore the provisional emote category. Documented items will appear here when verified.'},
] as const;
export const rarityNames = ['Common','Rare','Epic','Legendary','Exclusive'] as const;
export function findCategory(slug:string){return catalogCategories.find(category=>category.slug===slug);}
