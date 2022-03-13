class Vehicle {
    constructor(x, y) {
        this.pos = new p5.Vector(random(width), random(height))
        this.vel = p5.Vector.random2D()
        this.acc = new p5.Vector()

        this.rOriginal = SCALE_FACTOR

        this.r = SCALE_FACTOR
        this.target = new p5.Vector(x, y)
        this.maxspeed = 15
        this.maxforce = 25
        this.hue = random(360)

        this.showText = true

        /* our default color is black */
        this.color = color(0, 0, 0)
    }


    /** makes vehicles bounce off edges */
    edges() {
        if (this.pos.x > width) {
            this.vel.x *= -1
            this.pos.x = width
        } else if (this.pos.x < 0) {
            this.pos.x = 0
            this.vel.x *= -1
        } else if (this.pos.y > height) {
            this.vel.y *= -1
            this.pos.y = height
        } else if (this.pos.y < 0) {
            this.pos.y = 0
            this.vel.y *= -1
        }
    }


    /** makes vehicles wrap around edges */
    wrap() {

        if (this.pos.x > width) {
            this.pos.x = 1
        } else if (this.pos.x < 0) {
            this.pos.x = width-1
        } else if (this.pos.y > height) {
            this.pos.y = 1
        } else if (this.pos.y < 0) {
            this.pos.y = height-1
        }
    }


    fleeFromMouse() {
        /* applies a fleeing behavior based on distance from mouse */
        let mouse = new p5.Vector(mouseX, mouseY)
        let flee = this.flee(mouse).mult(2)
        let distance = p5.Vector.sub(this.pos, mouse).mag()
        if (distance < SCALE_FACTOR*4) {
            this.applyForce(flee)
        }
    }


    /** applies arrival behavior, sending this vehicle to its 'home' */
    returnToTextOrigin() {
        let arrive = this.arrive(this.target)
        this.applyForce(arrive)
    }


    seek(target) {
        // this gives you a vector pointing from us to the target
        let desired = p5.Vector.sub(target, this.pos)
        desired.setMag(this.maxspeed)

        // steering = desired - current
        let steer = p5.Vector.sub(desired, this.vel)
        return steer.limit(this.maxforce)
    }


    flee(target) {
        return this.seek(target).mult(-1)
        // watch out! technically, we should probably multiply our
        // desired velocity by -1 first before limiting
    }


    // like seek, but we slow down as we approach our target :3
    arrive(target) {
        // this gives you a vector pointing from us to the target
        let desired = p5.Vector.sub(target, this.pos)

        // the distance between two points is the magnitude of the
        // vector from one to the other
        let distance = desired.mag()

        let speed = this.maxspeed
        if (distance < 100) {
            speed = map(distance, 0, 100, 0, this.maxspeed)
        }

        desired.setMag(speed)

        // steering = desired - current
        let steer = p5.Vector.sub(desired, this.vel)
        return steer.limit(this.maxforce)
    }


    applyForce(f) {
        // F=ma, but we assume m=1, so F=a
        this.acc.add(f)
        this.acc.limit(this.maxforce)
    }


    update() {
        this.pos.add(this.vel)
        this.vel.add(this.acc)
        this.vel.limit(this.maxspeed)
        this.vel.mult(0.99)
        this.acc.mult(0)
    }


    renderPixel() {
        fill(this.color)
        noStroke()
        // colorMode(HSB, 360, 100, 100, 100)
        // fill(this.hue, 100, 100, 50)
        rect(
            this.pos.x,
            this.pos.y,
            SCALE_FACTOR,
            SCALE_FACTOR)
        // circle(this.pos.x, this.pos.y, this.r)
    }
}