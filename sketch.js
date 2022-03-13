/**
 *  @author Kiwi
 *  @date 2022.02.28
 *
 *  The aim is to scan the pixels of a small resolution video, convert said
 *  pixels to circles anchored to a location on a canvas, and apply steering
 *  behaviors to them.
 *
 *  video = createCapture(VIDEO) ❓ what is VIDEO? how do we load our own
 *  video.size(48, 48)
 *  in draw():
 *     video.loadPixels()
 *     pixelIndex = (i+j*video.width)*4
 *         j is columns, i is rows
 *     nested for loop for width and height
 *     grab color for each pixel
 *     draw to canvas
 *
 *  TODO
 *      add notes when bubbles warp from one edge to another
 */

/**
 *  ☐ center the canvas
 *  ☐ send pixels out and have them arrive in stages?
 */


let song
let font
let vehicles

let amp
let arrival // flag for whether 'going home' is turned on

let vid // our source video
let playing = false;
let button;

const VID_WIDTH = 64
const VID_HEIGHT = 36
let SCALE_FACTOR


function preload() {
    font = loadFont('data/bpdots.otf')
    vid = createVideo('data/dtn240p.mp4')
    arrival = true
}


// plays or pauses the video depending on current state
function toggleVid() {
    if (playing) {
        vid.pause()
        button.html('▶️')
    } else {
        vid.loop()
        vid.hide()
        button.html('⏸️')
    }

    playing = !playing;
}

function setup() {
    createCanvas(640, 360)
    // colorMode(HSB, 360, 100, 100, 100)
    colorMode(RGB, 255)
    rectMode(CORNER)

    SCALE_FACTOR = width/VID_WIDTH
    vid.hide()

    button = createButton('▶️');
    button.style('margin', '10px auto')
    button.style('display', 'block')
    button.style('background-color', 'rgb(32, 33, 51)')
    button.style('border', '0px')
    button.mousePressed(toggleVid); // attach button listener
    vid.size(VID_WIDTH, VID_HEIGHT)

    /**
     * create array of vehicles that map to 2D location grid
     *  set vehicle targets on the grid
     *      canvas size is 640x360 → video size 64x36. grid is 10 px +5 offset
     *      1D 'wrapping' array with col+row*vid.width, like loadPixels()
     *          you can call any vehicle at (i, j) with vehicles[i+j*36]
     */
    vehicles = []
    for (let j=0; j<VID_HEIGHT; j++) {
        for (let i=0; i<VID_WIDTH; i++) {
            // console.log(`${i}, ${j}`)
            vehicles.push(
                new Vehicle(
                    // i*SCALE_FACTOR-SCALE_FACTOR/2,
                    // j*SCALE_FACTOR-SCALE_FACTOR/2))
                    i*SCALE_FACTOR,
                    j*SCALE_FACTOR))
        }
    }
}


function draw() {
    // background(236, 37, 25)
    background(32, 33, 51)

    transferColorsToVehicles()

    /** display all the vehicles! */
    for (let v of vehicles) {
        v.update()
        // v.wrap()
        v.fleeFromMouse()
        v.renderPixel()

        if (arrival)
            v.returnToTextOrigin()
    }
}


/**
 * update colors for each vehicle at each 64x36 grid location
 */
function transferColorsToVehicles() {
    vid.loadPixels()
    for (let i = 0; i < VID_WIDTH; i++) {
        for (let j = 0; j < VID_HEIGHT; j++) {
            const pixelIndex = (i + j * VID_WIDTH) * 4
            const red = vid.pixels[pixelIndex];
            const green = vid.pixels[pixelIndex + 1];
            const blue = vid.pixels[pixelIndex + 2];

            const c = color(red, green, blue)
            // console.log(`${i}, ${j}`)
            vehicles[i + j * VID_WIDTH].color = c
        }
    }
}


function keyPressed() {
    /* toggle arrival */
    if (key === 's') {
        arrival = !arrival;
    }

    /* stop sketch */
    if (key === 'z') {
        noLoop()
    }

    /* arrival! +recolor */
    if (key === 'x') {
        arrival = true

        for (let index in vehicles) {
            vehicles[index].hue = map(index, 0, vehicles.length, 0, 330)
        }
    }

    /* recolor in ascending rainbow :p */
    if (key === 'c') {
        for (let index in vehicles) {
            vehicles[index].hue = index % 360
        }
    }
}


/**
 *  Fixes: sound being blocked https://talonendm.github.io/2020-11-16-JStips/
 *  Errors messages (CTRL SHIFT i) Chrome Developer Tools:
 *  The AudioContext was not allowed to start. It must be resumed (or
 *  created)  after a user gesture on the page. https://goo.gl/7K7WLu
 *
 *  Possibly unrelated: maybe we need to add sound.js.map too.
 *  DevTools failed to load SourceMap: Could not load content for
 *  https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/addons/p5.sound.min.js.map
 *  : HTTP error: status code 404, net::ERR_HTTP_RESPONSE_CODE_FAILURE
 */
function touchStarted() {
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume().then(r => {});
    }
}