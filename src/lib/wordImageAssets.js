import bajuImage from '../assets/word-images/baju.jpg'
import bolaImage from '../assets/word-images/bola.jpg'
import bukuImage from '../assets/word-images/buku.jpg'
import gigiImage from '../assets/word-images/gigi.jpg'
import gulaImage from '../assets/word-images/gula.jpg'
import kudaImage from '../assets/word-images/kuda.jpg'
import mataImage from '../assets/word-images/mata.jpg'
import mejaImage from '../assets/word-images/meja.jpg'
import rotiImage from '../assets/word-images/roti.jpg'
import sapiImage from '../assets/word-images/sapi.jpg'
import sapuImage from '../assets/word-images/sapu.jpg'
import topiImage from '../assets/word-images/topi.jpg'

const WORD_IMAGE_MAP = {
  baju: { src: bajuImage, shiftX: '0px', shiftY: '0px', scale: 1.02 },
  bola: { src: bolaImage, shiftX: '0px', shiftY: '0px', scale: 1.02 },
  buku: { src: bukuImage, shiftX: '4px', shiftY: '0px', scale: 1.08 },
  gigi: { src: gigiImage, shiftX: '0px', shiftY: '0px', scale: 1.03 },
  gula: { src: gulaImage, shiftX: '0px', shiftY: '0px', scale: 1.03 },
  kuda: { src: kudaImage, shiftX: '4px', shiftY: '0px', scale: 1.04 },
  mata: { src: mataImage, shiftX: '0px', shiftY: '0px', scale: 1.04 },
  meja: { src: mejaImage, shiftX: '0px', shiftY: '0px', scale: 1.02 },
  roti: { src: rotiImage, shiftX: '14px', shiftY: '0px', scale: 1.1 },
  sapi: { src: sapiImage, shiftX: '4px', shiftY: '0px', scale: 1.04 },
  sapu: { src: sapuImage, shiftX: '0px', shiftY: '0px', scale: 1.04 },
  topi: { src: topiImage, shiftX: '10px', shiftY: '0px', scale: 1.12 },
}

function normalizeWordKey(label) {
  return String(label ?? '')
    .trim()
    .toLowerCase()
    .replace(/^gambar:\s*/i, '')
}

export function getWordImageSrc(label) {
  return WORD_IMAGE_MAP[normalizeWordKey(label)]?.src ?? null
}

export function getWordImageAsset(label) {
  return WORD_IMAGE_MAP[normalizeWordKey(label)] ?? null
}
