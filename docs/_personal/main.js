// The title of the game to be displayed on the title screen
title = "CHARGE RUSH";

// The description, which is also displayed on the title screen
description = `
Destroy enemies.
`;

// The array of custom sprites
characters = [
`
  ll
  ll
ccllcc
ccllcc
ccllcc
cc  cc
`,`
rr  rr
rrrrrr
rrpprr
rrrrrr
  rr
  rr
`,`
y  y
yyyyyy
 y  y
yyyyyy
 y  y
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

	FBULLET_SPEED: 5,

	ENEMY_MIN_BASE_SPEED: 1.0,
	ENEMY_MAX_BASE_SPEED: 2.0,
	ENEMY_FIRE_RATE: 45,

	EBULLET_SPEED: 2.0,
	EBULLET_ROTATION_SPD: 0.1
};

// Game runtime options
// Refer to the official documentation for all available options
options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
    isCapturing: true,
    isCapturingGameCanvasOnly: true,
    captureCanvasScale: 2,
	seed: 1,
	isPlayingBgm: true,
	theme: "shapeDark",
	isReplayEnabled: true // super cool technique: replays your last run through
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

/**
 * @typedef {{
 * pos: Vector,
 * firingCooldown: number
 * }} Enemy
 */

/**
 * @type { Enemy [] }
 */
let enemies;

/**
 * @typedef {{
 * pos: Vector,
 * angle: number,
 * rotation: number
 * }} EBullet
 */



/**
 * @type { EBullet [] }
 */
let eBullets;

/**
 * @type { number }
 */
let currentEnemySpeed;

/**
 * @type { number }
 */
let waveCount;

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
		enemies = []; // store enemies
		eBullets = []; // store bullets

		waveCount = 0; // init wave count
		
	}

	// spawn enemies
	if (enemies.length === 0) {
		// difficulty: built-in library var (starts from 1 and increased 1 for every min passed)
		currentEnemySpeed = rnd(G.ENEMY_MIN_BASE_SPEED, G.ENEMY_MAX_BASE_SPEED) * difficulty;
		for (let i = 0; i < 9; i++) {
			const posX = rnd(0, G.WIDTH);
			const posY = -rnd(i * G.HEIGHT * 0.1);
			enemies.push({
				pos: vec(posX, posY),
				firingCooldown: G.ENEMY_FIRE_RATE
			});
			waveCount++; // increase tracking variable by 1
		}
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
		// get the side from which the bullet is fired
		// shorthand for an if statement (true, false result)
		const offset = (player.isFiringLeft)
			? -G.PLAYER_GUN_OFFSET
			: G.PLAYER_GUN_OFFSET;
		// Create bullet 
		fBullets.push({
			pos: vec(player.pos.x + offset, player.pos.y)
		});
		// Reset firing cooldown
		player.firingCooldown = G.PLAYER_FIRE_RATE;
		// Switch the side of the firing gun by flipping bool val
		player.isFiringLeft = !player.isFiringLeft;

		color("yellow");
		// Generate particles
		particle(
			player.pos.x + offset, // x coordinate
			player.pos.y, // y coordinate
			4, // num of particles
			1, // particle speed
			-PI/2, // emitting angle
			PI/4 // emitting width
		);
	}

    color ("black");
    char("a", player.pos);

	// Updating and drawing bullets
	fBullets.forEach((fb) => {
		// Move bullets upward
		fb.pos.y -= G.FBULLET_SPEED; // change vertical direction

		// Drawing fbullets for first time, allowing interaction from enemies
		color("yellow");
		box(fb.pos, 2); 
	});

	
	// another update loop
	// this time with remove()
	remove(enemies, (e) => {
		e.pos.y += currentEnemySpeed;
		e.firingCooldown--;
		// generate bullets after firing cool down reaches 0
		if (e.firingCooldown <= 0) {
			// create enemy bullets
			eBullets.push({
				pos: vec(e.pos.x, e.pos.y),
				angle: e.pos.angleTo(player.pos),
				rotation: rnd()
			});
			e.firingCooldown = G.ENEMY_FIRE_RATE;
			play("select"); 
		}
		color("black");
		// Shorthand to check for collision against another type
		// draw sprite
		const isCollidingWithFBullets = char("b", e.pos).isColliding.rect.yellow;
		
		// check whether to make particle explosion at collision or note
		if (isCollidingWithFBullets) {
			color("yellow");
			particle(e.pos); // emit explosion where enemy was
			play("explosion");
			addScore(10 * waveCount, e.pos);
		}
		// another condition to remove object
		return(isCollidingWithFBullets || e.pos.y > G.HEIGHT); // check for collision or outside of game window
	});

	// display number of bullets in game world
	// text(fBullets.length.toString(), 3, 10);

	// GOOD TO KNOW FOR FUTURE DELETION OUTSIDE WINDOW
	remove(fBullets, (fb) => { // delete any bullets outside of screen
		// interaction from fBullets to enemies, after enemies have been drawn
		color("yellow");
		const isCollidingWithEnemies = box(fb.pos, 2).isColliding.char.b;
		return (isCollidingWithEnemies || fb.pos.y < 0); // either collision or outside game window
	});

	remove(eBullets, (eb) => {
		// can also use angleTo function instead of trig
		eb.pos.x += G.EBULLET_SPEED * Math.cos(eb.angle);
		eb.pos.y += G.EBULLET_SPEED * Math.sin(eb.angle);
		// The bullet also rotates around itself
		eb.rotation += G.EBULLET_ROTATION_SPD;

		color("red");
		const isCollidingWithPlayer = char("c", eb.pos, {rotation: eb.rotation}).isColliding.char.a;

		if (isCollidingWithPlayer) {
			// End the game
			end();
			play("powerUp");
		}

		const isCollidingWithFBullets = char("c", eb.pos, {rotation: eb.rotation}).isColliding.rect.yellow;
		if (isCollidingWithFBullets) addScore(1, eb.pos);

		// remove eBullet if not on screen
		return (!eb.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT));
	})


}