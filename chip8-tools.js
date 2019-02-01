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

Instruction.parseAll(bytes, cb) {
    for (var i = 0; i < bytes.length - 1; i += 2) {
        var binary = (bytes[i] << 8) | bytes[i + 1];
        cb(Instruction.parse(binary), binary);
    }
}

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