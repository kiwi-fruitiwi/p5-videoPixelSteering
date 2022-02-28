/**
 *  @author Kiwi
 *  @date 2022.02.28
 *
 *  The aim is to scan the pixels of a small resolution video, convert said
 *  pixels to circles anchored to a location on a canvas, and apply steering
 *  behaviors to them.
 *
 *
 */


let song
let font
let vehicles = []
let points = []

let amp
let arrival // flag for whether 'going home' is turned on


function preload() {
    font = loadFont('data/bpdots.otf')
    // font = loadFont('data/consola.ttf')
    song = loadSound('data/danielTiger.mp3', null, null)
}


function setup() {
    createCanvas(600, 300)
    colorMode(HSB, 360, 100, 100, 100)

    textAlign(CENTER, CENTER);
    /**
     *  Add two sets of points: happy birthday, and Liya! centered below.
     *  TODO: gain an additional parameter: size. map to all points?
     */
    points = font.textToPoints('happy birthday, ', 80, 100, 48, {
        sampleFactor: 0.01, // increase for more points
        // simplifyThreshold: 0 // increase to remove collinear points
    })

    points = points.concat(font.textToPoints('Liya!', 200, 175, 72, {
        sampleFactor: 0.06, // increase for more points
    }))


    /** populate vehicles array with their coordinates from textToPoints */
    for (let i = 0; i < points.length; i++) {
        let pt = points[i]
        let vehicle = new Vehicle(pt.x, pt.y)
        vehicles.push(vehicle)
    }

    amp = new p5.Amplitude()
    arrival = false
}


function draw() {
    background(236, 37, 25)

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

    let level = amp.getLevel();
    let size = map(level, 0, 1, 2, 120);

    /* adjust the vehicle's radius */
    const grow = (pt, radius) => {
        pt.r = radius
    }

    for (let v of vehicles) {
        grow(v, size)
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