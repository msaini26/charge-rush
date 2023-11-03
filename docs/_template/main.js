// The title of the game to be displayed on the title screen
title = "CHARGE RUSH";

// The description, which is also displayed on the title screen
description = `
`;

// The array of custom sprites
characters = [
`
  PP
  PP
ccPPcc
ccPPcc
ccPPcc
cc  cc
`
];

// Game design variable container
const G = {
	WIDTH: 100,
	HEIGHT: 150,

    STAR_SPEED_MIN: 0.5,
	STAR_SPEED_MAX: 1.0,

	PLAYER_FIRE_RATE: 4,
	PLAYER_GUN_OFFSET: 3,

	FBULLET_SPEED: 5
};

// Game runtime options
// Refer to the official documentation for all available options
options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
    isCapturing: true,
    isCapturingGameCanvasOnly: true,
    captureCanvasScale: 2
};

// JSDoc comments for typing
/**
 * @typedef {{
 * pos: Vector,
 * speed: number
 * }} Star
 */

/**
 * @type { Star [] }
 */
let stars;

/**
 * @typedef {{
 * pos: Vector,
 * firingCooldown: number,
 * isFiringLeft: boolean
 * }} Player
 */

/**
 * @type { Player }
 */
let player;

/**
 * @typedef {{
 * pos: Vector
 * }} FBullet
 */

/**
 * @type { FBullet [] }
 * 
 */
let fBullets;

// The game loop function
function update() {
    // The init function running at startup
	if (!ticks) {
        // A CrispGameLib function
        // First argument (number): number of times to run the second argument
        // Second argument (function): a function that returns an object. This
        // object is then added to an array. This array will eventually be
        // returned as output of the times() function.
		stars = times(20, () => {
            // Random number generator function
            // rnd( min, max )
            const posX = rnd(0, G.WIDTH);
            const posY = rnd(0, G.HEIGHT);
            // An object of type Star with appropriate properties
            return {
                // Creates a Vector
                pos: vec(posX, posY),
                // More RNG
                speed: rnd(G.STAR_SPEED_MIN, G.STAR_SPEED_MAX)
            };
        });

        player = {
            pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
			firingCooldown: G.PLAYER_FIRE_RATE,
			isFiringLeft: true
        };

		fBullets = []; // store bullets in array
	}

    // Update for Star
    stars.forEach((s) => {
        // Move the star downwards
        s.pos.y += s.speed;
        // Bring the star back to top once it's past the bottom of the screen
        if (s.pos.y > G.HEIGHT) s.pos.y = 0;

        // Choose a color to draw
        color("light_black");
        // Draw the star as a square of size 1
        box(s.pos, 1);
    });

	// updating and drawing the player and input position x and y
    player.pos = vec(input.pos.x, input.pos.y);
    player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);

	// Cooling down for the next shot
	player.firingCooldown--;
	// Time to fire the next shot
	if (player.firingCooldown <= 0) {
		// Create bullet 
		fBullets.push({
			pos: vec(player.pos.x, player.pos.y)
		});
		// Reset firing cooldown
		player.firingCooldown = G.PLAYER_FIRE_RATE;
	}

    color ("black");
    char("a", player.pos);

	// Updating and drawing bullets
	fBullets.forEach((fb) => {
		// Move bullets upward
		fb.pos.y -= G.FBULLET_SPEED; // change vertical direction

		// Drawing
		color("black");
		box(fb.pos, 2); 
	});

	// display number of bullets in game world
	text(fBullets.length.toString(), 3, 10);

	// GOOD TO KNOW FOR FUTURE DELETION OUTSIDE WINDOW
	remove(fBullets, (fb) => { // delete any bullets outside of screen
		return fb.pos.y < 0; 
	});
}