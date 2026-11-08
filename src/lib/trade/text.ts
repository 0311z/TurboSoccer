const unsafe=/https?:|www\.|discord\.gg|\b(?:paypal|cashapp|venmo|usd|eur|dollars?|real money|robux)\b/i;
export function isSafeTradeText(value:string){return value.length<=280&&!unsafe.test(value);}
