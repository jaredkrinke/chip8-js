// Instructions
function createEnum(values) {
    var o = {
        _names: []
    };

    for (var i = 0; i < values.length; i++) {
        var index = i + 1;
        o[values[i]] = index;
        o._names[index] = values[i];
    }

    return o;
}

var Opcode = createEnum([
    "nop",
    "cls",
    "draw",
    "ldstr",
    "j",
    "jr0",
    "ret",
    "call",
    "seq",
    "seqr",
    "sneq",
    "sneqr",
    "skp",
    "sknp",
    "ldi",
    "copy",
    "ldx",
    "ldai",
    "ldaf",
    "addar",
    "stx",
    "stbr",
    "ldrdt",
    "lddtr",
    "ldkp",
    "addi",
    "addr",
    "subr",
    "busr",
    "orr",
    "andr",
    "xorr",
    "shr",
    "shl",
    "rnd",
    "raw"
]);

var Instruction = {};
Instruction.create = function (opcode, argument1, argument2, argument3) {
    return {
        opcode: opcode,
        a: argument1,
        b: argument2,
        c: argument3
    }
};

Instruction.parse = function (binary) {
    switch ((binary >> 12) & 0xf) {
        case 0:
        {
            switch (binary & 0xfff) {
                case 0x0e0:
                return Instruction.create(Opcode.cls);
                break;

                case 0x0ee:
                return Instruction.create(Opcode.ret);
                break;
            }
        }
        break;

        case 1:
        return Instruction.create(Opcode.j, binary & 0xfff);
        break;

        case 2:
        return Instruction.create(Opcode.call, binary & 0xfff);
        break;

        case 3:
        return Instruction.create(Opcode.seq, (binary >> 8) & 0xf, binary & 0xff);
        break;

        case 4:
        return Instruction.create(Opcode.sneq, (binary >> 8) & 0xf, binary & 0xff);
        break;

        case 5:
        return Instruction.create(Opcode.seqr, (binary >> 8) & 0xf, (binary >> 4) & 0xf);
        break;

        case 6:
        return Instruction.create(Opcode.ldi, (binary >> 8) & 0xf, binary & 0xff);
        break;

        case 7:
        return Instruction.create(Opcode.addi, (binary >> 8) & 0xf, binary & 0xff);
        break;

        case 8:
        {
            switch (binary & 0xf) {
                case 0:
                return Instruction.create(Opcode.copy, (binary >> 8) & 0xf, (binary >> 4) & 0xf);
                break;

                case 1:
                return Instruction.create(Opcode.orr, (binary >> 8) & 0xf, (binary >> 4) & 0xf);
                break;

                case 2:
                return Instruction.create(Opcode.andr, (binary >> 8) & 0xf, (binary >> 4) & 0xf);
                break;

                case 3:
                return Instruction.create(Opcode.xorr, (binary >> 8) & 0xf, (binary >> 4) & 0xf);
                break;

                case 4:
                return Instruction.create(Opcode.addr, (binary >> 8) & 0xf, (binary >> 4) & 0xf);
                break;

                case 5:
                return Instruction.create(Opcode.subr, (binary >> 8) & 0xf, (binary >> 4) & 0xf);
                break;

                case 6:
                return Instruction.create(Opcode.shr, (binary >> 8) & 0xf);
                break;

                case 7:
                return Instruction.create(Opcode.busr, (binary >> 8) & 0xf, (binary >> 4) & 0xf);
                break;

                case 0xe:
                return Instruction.create(Opcode.shl, (binary >> 8) & 0xf);
                break;
            }
        }
        break;

        case 9:
        return Instruction.create(Opcode.sneqr, (binary >> 8) & 0xf, (binary >> 4) & 0xf);
        break;

        case 0xa:
        return Instruction.create(Opcode.ldai, binary & 0xfff);
        break;

        case 0xb:
        return Instruction.create(Opcode.jr0, binary & 0xfff);
        break;

        case 0xc:
        return Instruction.create(Opcode.rnd, (binary >> 8) & 0xf, binary & 0xff);
        break;

        case 0xd:
        return Instruction.create(Opcode.draw, (binary >> 8) & 0xf, (binary >> 4) & 0xf, binary & 0xf);
        break;

        case 0xe:
        {
            switch (binary & 0xff) {
                case 0x9e:
                return Instruction.create(Opcode.skp, (binary >> 8) & 0xf);
                break;

                case 0xa1:
                return Instruction.create(Opcode.sknp, (binary >> 8) & 0xf);
                break;
            }
        }
        break;

        case 0xf:
        {
            switch (binary & 0xff) {
                case 7:
                return Instruction.create(Opcode.ldrdt, (binary >> 8) & 0xf);
                break;

                case 0xa:
                return Instruction.create(Opcode.ldkp, (binary >> 8) & 0xf);
                break;

                case 0x15:
                return Instruction.create(Opcode.lddtr, (binary >> 8) & 0xf);
                break;

                case 0x18:
                return Instruction.create(Opcode.ldstr, (binary >> 8) & 0xf);
                break;

                case 0x1e:
                return Instruction.create(Opcode.addar, (binary >> 8) & 0xf);
                break;

                case 0x29:
                return Instruction.create(Opcode.ldaf, (binary >> 8) & 0xf);
                break;

                case 0x33:
                return Instruction.create(Opcode.stbr, (binary >> 8) & 0xf);
                break;

                case 0x55:
                return Instruction.create(Opcode.stx, (binary >> 8) & 0xf);
                break;

                case 0x65:
                return Instruction.create(Opcode.ldx, (binary >> 8) & 0xf);
                break;
            }
        }
        break;
    }

    return Instruction.create(Opcode.raw, binary);
};

Instruction.parseAll = function (bytes, cb) {
    for (var i = 0; i < bytes.length - 1; i += 2) {
        var binary = (bytes[i] << 8) | bytes[i + 1];
        cb(Instruction.parse(binary), binary);
    }
};

Instruction.stringify = function (instruction) {
    // TODO: Consider distinguishing registers, etc.
    var str = Opcode._names[instruction.opcode];
    if (instruction.a !== undefined) {
        str += " " + instruction.a;
    }
    if (instruction.b !== undefined) {
        str += " " + instruction.b;
    }
    if (instruction.c !== undefined) {
        str += " " + instruction.c;
    }
    return str;
};

// Processing
var Register = createEnum([
    "v0",
    "v1",
    "v2",
    "v3",
    "v4",
    "v5",
    "v6",
    "v7",
    "v8",
    "v9",
    "va",
    "vb",
    "vc",
    "vd",
    "ve",
    "vf",   // Used for carry flag (8 bits)
    "dt",   // Delay timer (60 Hz) (8 bits)
    "st",   // Sound timer (60 Hz) (8 bits)
    "sp",   // Stack pointer (8 bits)
    "i",    // Address register (16 bits)
    "pc"    // Program counter (16 bits)
]);

function createArray(size) {
    var array = [];
    for (var i = 0; i < size; i ++) {
        array[i] = 0;
    }
    return array;
}

function clearArray(array) {
    for (var i = 0; i < array.length; i++) {
        array[i] = 0;
    }
}

var displayWidth = 64;
var displayHeight = 32;
var font = [
    0xf0, 0x90, 0x90, 0x90, 0xf0, // 0
    0x20, 0x60, 0x20, 0x20, 0x70, // 1
    0xf0, 0x10, 0xf0, 0x80, 0xf0, // 2
    0xf0, 0x10, 0xf0, 0x10, 0xf0, // 3
    0x90, 0x90, 0xf0, 0x10, 0x10, // 4
    0xf0, 0x80, 0xf0, 0x10, 0xf0, // 5
    0xf0, 0x80, 0xf0, 0x90, 0xf0, // 6
    0xf0, 0x10, 0x20, 0x40, 0x40, // 7
    0xf0, 0x90, 0xf0, 0x90, 0xf0, // 8
    0xf0, 0x90, 0xf0, 0x10, 0xf0, // 9
    0xf0, 0x90, 0xf0, 0x90, 0x90, // a
    0xe0, 0x90, 0xe0, 0x90, 0xe0, // b
    0xf0, 0x80, 0x80, 0x80, 0xf0, // c
    0xe0, 0x90, 0x90, 0x90, 0xe0, // d
    0xf0, 0x80, 0xf0, 0x80, 0xf0, // e
    0xf0, 0x80, 0xf0, 0x80, 0x80  // f
];

var Chip8State = createEnum([
    "paused",
    "running"
]);

var Chip8 = {
    frequency: 6000, // Hz
    started: undefined,
    counter: 0,

    state: Chip8State.paused,
    nextState: Chip8State.paused,
    lastState: Chip8State.paused,
    yieldedKey: undefined,

    displayUpdated: undefined,

    registers: createArray(Register._names.length),
    stack: createArray(32), // 16 bits each
    memory: createArray(4096), // 8 bits each
    display: createArray(displayWidth * displayHeight), // 1 bit each
    keys: createArray(16),

    reset: function (binary) {
        this.state = Chip8State.paused;

        clearArray(this.registers);
        clearArray(this.stack);
        clearArray(this.memory);
        clearArray(this.display);
        clearArray(this.keys);

        // Fonts
        var fontBase = 0;
        for (var i = 0; i < font.length; i++) {
            this.memory[fontBase + i] = font[i];
        }

        var base = 0x200;
        for (var i = 0; i < binary.length; i++) {
            this.memory[base + i] = binary[i];
        }
    
        this.registers[Register.pc] = base;
    },

    get16: function (address) {
        return (this.memory[address] << 8) | (this.memory[address + 1]);
    },

    getxy: function (x, y) {
        return this.display[y * displayWidth + x];
    },

    setxy: function (x, y, value) {
        var index = y * displayWidth + x;
        this.display[index] = value;
    },

    process: function () {
        if (this.lastState == Chip8State.paused && this.state == Chip8State.running) {
            this.started = Date.now();
            this.counter = 0;
        }
        this.lastState = this.state;

        // Update timers
        if (this.started) {
            var counter = Math.floor((Date.now() - this.started) / (1000 / 60));
            if (counter > 0) {
                var steps = counter - this.counter;
                if (steps > 0) {
                    this.registers[Register.dt] = Math.max(0, this.registers[Register.dt] - steps);
                    this.registers[Register.st] = Math.max(0, this.registers[Register.st] - steps);
                }
            }
            this.counter = counter;
        }

        // Fetch instruction
        var pc = this.registers[Register.pc];
        this.registers[Register.pc] = pc + 2;

        var instruction = Instruction.parse(this.get16(pc));
        switch (instruction.opcode) {
            case Opcode.cls:
            this.displayUpdated(true);
            clearArray(this.display);
            break;

            case Opcode.draw:
            var spriteAddress = this.registers[Register.i];
            var x0 = this.registers[instruction.a];
            var y0 = this.registers[instruction.b];
            var bytes = instruction.c;
            var collided = false;
            for (var byte = 0; byte < bytes; byte++) {
                for (var i = 0; i < 8; i++) {
                    var x = (x0 + i) % displayWidth;
                    var y = (y0 + byte) % displayHeight;
                    var pixel_destination = this.getxy(x, y);
                    var pixel_source = (this.memory[spriteAddress + byte] >> (7 - i)) & 0x1;
                    this.setxy(x, y, pixel_destination ^ pixel_source);
                    if (pixel_destination && pixel_source) {
                        collided = true;
                    }
                }
            }

            this.registers[Register.vf] = collided ? 1 : 0;
            break;

            case Opcode.ldstr:
            this.registers[Register.st] = this.registers[instruction.a];
            break;

            case Opcode.j:
            this.registers[Register.pc] = instruction.a;
            break;

            case Opcode.jr0:
            this.registers[Register.pc] = instruction.a + this.registers[0];
            break;

            case Opcode.ret:
            var sp = this.registers[Register.sp] - 1;
            this.registers[Register.pc] = this.stack[sp];
            this.registers[Register.sp] = sp;
            break;

            case Opcode.call:
            var sp = this.registers[Register.sp];
            this.stack[sp] = this.registers[Register.pc];
            this.registers[Register.sp] = sp + 1;
            break;

            case Opcode.seq:
            if (this.registers[instruction.a] === instruction.b) {
                this.registers[Register.pc] = pc + 4;
            }
            break;

            case Opcode.seqr:
            if (this.registers[instruction.a] === this.registers[instruction.b]) {
                this.registers[Register.pc] = pc + 4;
            }
            break;

            case Opcode.sneq:
            if (this.registers[instruction.a] !== instruction.b) {
                this.registers[Register.pc] = pc + 4;
            }
            break;

            case Opcode.sneqr:
            if (this.registers[instruction.a] !== this.registers[instruction.b]) {
                this.registers[Register.pc] = pc + 4;
            }
            break;

            case Opcode.skp:
            if (this.keys[this.registers[instruction.a]]) {
                this.registers[Register.pc] = pc + 4;
            }
            break;

            case Opcode.sknp:
            if (!this.keys[this.registers[instruction.a]]) {
                this.registers[Register.pc] = pc + 4;
            }
            break;

            case Opcode.ldi:
            this.registers[instruction.a] = instruction.b;
            break;

            case Opcode.copy:
            this.registers[instruction.a] = this.registers[instruction.b];
            break;

            case Opcode.ldx:
            var max = instruction.a;
            var base = this.registers[Register.i];
            for (var i = 0; i <= max; i++) {
                this.registers[i] = this.memory[base + i];
            }
            break;

            case Opcode.ldai:
            this.registers[Register.i] = instruction.a;
            break;

            case Opcode.ldaf:
            var value = this.registers[instruction.a];
            if (value >= 0 && value <= 15) {
                this.registers[Register.i] = this.registers[instruction.a] * 5;
            }
            break;

            case Opcode.addar:
            this.registers[Register.i] = this.registers[Register.i] + this.registers[instruction.a];
            break;

            case Opcode.stx:
            var max = instruction.a;
            var base = this.registers[Register.i];
            for (var i = 0; i <= max; i++) {
                this.memory[base + i] = this.registers[i];
            }
            break;

            case Opcode.stbr:
            var value = this.registers[instruction.a];
            var base = this.registers[Register.i];
            this.memory[base] = Math.floor(value / 100);
            this.memory[base + 1] = Math.floor((value % 100) / 10);
            this.memory[base + 2] = value % 10;
            break;

            case Opcode.ldrdt:
            this.registers[instruction.a] = this.registers[Register.dt];
            break;

            case Opcode.lddtr:
            this.registers[Register.dt] = this.registers[instruction.a];
            break;

            case Opcode.ldkp:
            if (this.yieldedKey !== undefined && this.yieldedKey !== null) {
                this.registers[instruction.a] = this.yieldedKey;
                this.resume();
                this.yieldedKey = undefined;
            } else {
                if (this.yieldedKey === undefined) {
                    this.nextState = this.state;
                    this.state = Chip8State.paused;
                    this.yieldedKey = null;
                }

                this.registers[Register.pc] = pc; // Don't advance
            }
            break;

            case Opcode.addi:
            case Opcode.addr:
            var a = this.registers[instruction.a];
            var b = (instruction.opcode == Opcode.addi) ? instruction.b : this.registers[instruction.b];
            var result = a + b;
            this.registers[instruction.a] = result % 256;
            this.registers[Register.vf] = (result < 256) ? 0 : 1;
            break;

            case Opcode.subr:
            case Opcode.busr:
            var a, b;
            if (instruction.opcode == Opcode.subr) {
                a = this.registers[instruction.a]
                b = this.registers[instruction.b]
            } else {
                a = this.registers[instruction.b]
                b = this.registers[instruction.a]
            }
            var result = a - b;
            if (result > 0) {
                this.registers[instruction.a] = result;
                this.registers[Register.vf] = 0;
            } else {
                this.registers[instruction.a] = result + 256;
                this.registers[Register.vf] = 1;
            }
            break;

            case Opcode.orr:
            this.registers[instruction.a] = this.registers[instruction.a] | this.registers[instruction.b];
            break;

            case Opcode.andr:
            this.registers[instruction.a] = this.registers[instruction.a] & this.registers[instruction.b];
            break;

            case Opcode.xorr:
            this.registers[instruction.a] = this.registers[instruction.a] ^ this.registers[instruction.b];
            break;

            case Opcode.shr:
            var value = this.registers[instruction.a];
            this.registers[Register.vf] = a & 0x1;
            this.registers[instruction.a] = value >> 1;
            break;

            case Opcode.shl:
            var value = this.registers[instruction.a];
            this.registers[Register.vf] = a >> 7;
            this.registers[instruction.a] = value << 1;
            break;

            case Opcode.rnd:
            this.registers[instruction.a] = Math.floor(Math.random() * 256) & instruction.b;
            break;
        }
    },

    step: function () {
        this.nextState = this.state;
        this.state = Chip8State.paused;
        this.process();
    },

    resume: function () {
        this.state = this.nextState;
        if (this.state === Chip8State.running) {
            // Run in chunks of 1/60th of a second
            var next = Date.now() + 1000 / 60;
            for (var i = 0; i < this.frequency / 60; i++) {
                this.process();
            }

            // Delay, if needed
            var now = Date.now();
            var delay = 0;
            if (now < next) {
                delay = next - now;
            }

            // TODO: Better logic for updating display
            this.displayUpdated(false);

            var that = this;
            setTimeout(function () {
                if (that.state === Chip8State.running) {
                    that.run(that.displayUpdated);
                }
            }, delay)
        }
    },

    run: function (displayUpdated) {
        // TODO: This shouldn't schedule another callback if one is already running!
        this.displayUpdated = displayUpdated;
        this.nextState = Chip8State.running;
        this.resume();
    }
};


// Parsing
function parseHex(s) {
    var tokens = s.split(/[, \n]+/);
    var bytes = [];
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (token.length == 2) {
            bytes.push(parseInt(token, 16));
        }
    }

    return bytes;
}

// Input
function getKeyFromEvent(event) {
    var char =  String.fromCharCode(event.keyCode);
    if (char !== undefined && char !== null) {
        char = char.toLowerCase();
        if ((char >= "0" && char <= "9") || (char >= "a" && char <= "f")) {
            var index = parseInt(char, 16);
            return index;
        }
    }
}

document.addEventListener("keydown", function(event) {
    var index = getKeyFromEvent(event);
    if (index !== undefined) {
        Chip8.keys[index] = true;

        if (Chip8.yieldedKey === null) {
            Chip8.yieldedKey = index;
            Chip8.resume();
        }
    }
}, false);

document.addEventListener("keyup", function(event) {
    var index = getKeyFromEvent(event);
    if (index !== undefined) {
        Chip8.keys[index] = false;
    }
}, false);

// Display
var Display = {
    canvas:  document.getElementById("chip8_display"),
    context: document.getElementById("chip8_display").getContext("2d"),

    refresh: function () {
        var width = this.canvas.width;
        var height = this.canvas.height;
        this.context.fillStyle = "#000";
        this.context.fillRect(0, 0, width, height);
        this.context.fillStyle = "#0f0";

        var pw = width / displayWidth;
        var ph = height / displayHeight;

        for (var x = 0; x < displayWidth; x++) {
            for (var y = 0; y < displayHeight; y++) {
                if (Chip8.getxy(x, y)) {
                    this.context.fillRect(x * pw, y * ph, pw, ph);
                }
            }
        }
    }
};

// Processor state
var stateNext = document.getElementById("chip8_state_next");
function updateState() {
    var binary = Chip8.get16(Chip8.registers[Register.pc]);
    var instruction = Instruction.parse(binary);
    stateNext.innerText = Instruction.stringify(instruction);
}

// Control
var started = false;
function startIfNeeded() {
    if (!started) {
        var hex = document.getElementById("chip8_hex").value;
        var bytes = parseHex(hex);
        Chip8.reset(bytes);
        Display.refresh();
        started = true;
    }
}

document.getElementById("chip8_run").onclick = function () {
    startIfNeeded();
    Chip8.state = Chip8State.running;

    var lastDisplay = 0;
    Chip8.run(function (flush) {
        var now = Date.now();
        if (flush || (now - lastDisplay) > (1000 / 30)) {
            Display.refresh();
            lastDisplay = now;
        }
    });
};

document.getElementById("chip8_step").onclick = function () {
    startIfNeeded();
    Chip8.step();
    Display.refresh();
    updateState();
};

// Disassembler
function disassemble(bytes) {
    var s = "";
    Instruction.parseAll(bytes, function (instruction) {
        s += Instruction.stringify(instruction);
        s += "\n";
    });
    return s;
}

document.getElementById("chip8_disassemble").onclick = function () {
    var hex = document.getElementById("chip8_hex").value;
    var bytes = parseHex(hex);
    document.getElementById("chip8_disassembly").value = disassemble(bytes);
};