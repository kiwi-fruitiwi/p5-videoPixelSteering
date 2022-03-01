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


let song
let font
let vehicles = []
let points = []

let amp
let arrival // flag for whether 'going home' is turned on

let vid // our source video

function preload() {
    font = loadFont('data/bpdots.otf')
    // font = loadFont('data/consola.ttf')
    song = loadSound('data/danielTiger.mp3', null, null)
    vid = createVideo('data/dtn240p.mp4')
}

let playing = false;
let button;

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
    colorMode(HSB, 360, 100, 100, 100)

    vid.hide()

    button = createButton('▶️');
    button.style('margin', '10px auto')
    button.style('display', 'block')
    button.style('background-color', 'rgb(32, 33, 51)')
    button.style('border', '0px')
    button.mousePressed(toggleVid); // attach button listener
    vid.size(64, 36)


}


function draw() {
    background(236, 37, 25)

    vid.loadPixels()
    /* loadPixels data is only done in rgb, so we can switch temporarily */
    colorMode(RGB, 255)

    for (let c=0; c<vid.width; c++) {
        for (let r=0; r<vid.height; r++) {
            const pixelIndex = (c+r*vid.width)*4
            const red = vid.pixels[pixelIndex + 0];
            const green = vid.pixels[pixelIndex + 1];
            const blue = vid.pixels[pixelIndex + 2];

            stroke(red, green, blue)
            strokeWeight(15)
            point(c*10+5, r*10+5)
        }
    }

    colorMode(HSB, 360, 100, 100, 100)


    /** display all points and behaviors */
    for (let i = 0; i < vehicles.length; i++) {
        let v = vehicles[i]
        v.fleeFromMouse()
        v.update()
        v.wrap()
        v.show()

        if (arrival)
            v.returnToTextOrigin()
    }
}


function keyPressed() {
    /* begin song */
    if (key === 's') {
        song.play()
    }

    /* stop sketch */
    if (key === 'z') {
        noLoop()
        song.stop()
    }

    /* arrival! +recolor */
    if (key === 'x') {
        arrival = true

        for (let index in vehicles) {
            vehicles[index].hue = map(index, 0, vehicles.length, 0, 330)
            vehicles[index].r = 2
            vehicles[index].showText = false
        }
    }

    /* recolor in ascending rainbow :p */
    if (key === 'c') {
        for (let index in vehicles) {
            vehicles[index].hue = index
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