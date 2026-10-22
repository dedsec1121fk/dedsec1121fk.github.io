import {timingSafeEqual} from 'node:crypto';
// Version 1: browser PBKDF2-SHA256/600000, server PBKDF2-SHA256/100000,
// then HMAC with a server-only pepper. Never accept raw account passwords.
export const CLIENT_ITERATIONS=600000;
export const SERVER_ITERATIONS=100000;
const enc=new TextEncoder();
export const hex=data=>Array.from(new Uint8Array(data),b=>b.toString(16).padStart(2,'0')).join('');
export function unhex(s){if(typeof s!=='string'||s.length%2||!/^[0-9a-f]+$/i.test(s))throw Error('invalid_hex');return Uint8Array.from(s.match(/../g),b=>parseInt(b,16));}
export const random=n=>hex(crypto.getRandomValues(new Uint8Array(n)));
export async function digest(s){return hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));}
export async function mac(secret,value){const key=await crypto.subtle.importKey('raw',unhex(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,enc.encode(value)));}
export function equal(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;return timingSafeEqual(enc.encode(a),enc.encode(b));}
export async function verifier(prehash,salt,pepper){if(!/^[0-9a-f]{64}$/.test(prehash))throw Error('invalid_credentials');const key=await crypto.subtle.importKey('raw',unhex(prehash),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:unhex(salt),iterations:SERVER_ITERATIONS},key,256);return mac(pepper,hex(bits));}
