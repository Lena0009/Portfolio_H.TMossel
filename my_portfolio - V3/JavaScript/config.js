/*This file holds your global variables and the initial centering math from your script.*/ 
// JavaScript/config.js
export const viewport = document.getElementById('viewport');
export const canvas = document.getElementById('canvas');
export const WORLD_SIZE = 30000;

// Shared State
export const state = {
    isDragging: false,
    /*This is to change the scale of the website*/
    scale: 1,
    currentX: 0,
    currentY: 0,
    startX: 0,
    startY: 0,
    // Matching your provided script's initial offsets
    offsetX: 9000, 
    offsetY: 9000,
    cardX: 9000,
    cardY: 9000
};

// Calculate initial centering
const heroCard = document.querySelector('.hero-card');
const cardWidth = heroCard ? heroCard.offsetWidth : 1400; // Fallback if not loaded
const cardHeight = heroCard ? heroCard.offsetHeight : 800;

state.currentX = (window.innerWidth / 2) - (state.cardX + cardWidth / 2) * state.scale;
state.currentY = (window.innerHeight / 2) - (state.cardY + cardHeight / 2) * state.scale;


