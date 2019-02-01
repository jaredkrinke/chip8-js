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

var Chip8 = {
    registers: createArray(Register._names.length),
    stack: createArray(32), // 16 bits each
    memory: createArray(4096), // 8 bits each
    display: createArray(displayWidth * displayHeight), // 1 bit each
    keys: createArray(16),

    reset: function (binary) {
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
        var pc = this.registers[Register.pc];
        this.registers[Register.pc] = pc + 1;

        var instruction = Instruction.parse(this.get16(pc));
        switch (instruction.opcode) {
            case Opcode.cls:
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
        }
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

// Control
var started = false;
document.getElementById("chip8_step").onclick = function () {
    if (!started) {
        var hex = document.getElementById("chip8_hex").value;
        var bytes = parseHex(hex);
        Chip8.reset(bytes);
        Display.refresh();
        started = true;
    }

    Chip8.process();
    Display.refresh();
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