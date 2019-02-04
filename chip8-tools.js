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

var ArgumentType = createEnum([
    "register",
    "word",
    "address",
    "byte",
    "halfByte",
    "i",
    "dt",
    "st"
]);

// Argument types that are represented as numbers
var ArgumentClass = createEnum([
    "unique", // default
    "number"
]);

// TODO: At some point, addresses can probably be addresses or labels
var argumentTypeToClass = {};
argumentTypeToClass[ArgumentType.word] = ArgumentClass.number;
argumentTypeToClass[ArgumentType.address] = ArgumentClass.number;
argumentTypeToClass[ArgumentType.halfByte] = ArgumentClass.number;
argumentTypeToClass[ArgumentType.byte] = ArgumentClass.number;

var argumentTypeToBits = {};
argumentTypeToBits[ArgumentType.word] = 16;
argumentTypeToBits[ArgumentType.address] = 12;
argumentTypeToBits[ArgumentType.byte] = 8;
argumentTypeToBits[ArgumentType.halfByte] = 4;

function Argument(type, position) {
    this.type = type;
    this.position = position;
}

var argumentToUniqueType = {};
argumentToUniqueType.I = ArgumentType.i;
argumentToUniqueType.DT = ArgumentType.dt;
argumentToUniqueType.ST = ArgumentType.st;

Argument.parse = function (token) {

};

var Opcode = createEnum([
    "cls",
    "drw",
    "ldstr",
    "j",
    "jo",
    "ret",
    "call",
    "seq",
    "seqr",
    "sneq",
    "sneqr",
    "skp",
    "sknp",
    "ldi",
    "cpy",
    "ldx",
    "ldai",
    "ldaf",
    "addar",
    "stx",
    "stbcd",
    "ldrdt",
    "lddtr",
    "ldkp",
    "addi",
    "addr",
    "sub",
    "bus",
    "or",
    "and",
    "xor",
    "shr",
    "shl",
    "rnd",
    "raw"
]);

function InstructionDeclaration(name, opcode, encoding, mask, arguments) {
    this.name = name;
    this.opcode = opcode;
    this.encoding = encoding;
    this.mask = mask;
    this.arguments = arguments;
}

var instructionSet = [
    new InstructionDeclaration("clear", Opcode.cls, 0x00e0, 0xffff, []),
    new InstructionDeclaration("draw", Opcode.drw, 0xd000, 0xf000, [ new Argument(ArgumentType.register, 8), new Argument(ArgumentType.register, 4), new Argument(ArgumentType.halfByte, 0) ]),

    new InstructionDeclaration("set", Opcode.ldi, 0x6000, 0xf000, [ new Argument(ArgumentType.register, 8), new Argument(ArgumentType.byte, 0) ]),
    new InstructionDeclaration("set", Opcode.cpy, 0x8000, 0xf00f, [ new Argument(ArgumentType.register, 8), new Argument(ArgumentType.register, 4) ]),
    new InstructionDeclaration("set", Opcode.ldstr, 0xf018, 0xf0ff, [ new Argument(ArgumentType.st), new Argument(ArgumentType.register, 8) ]),
    new InstructionDeclaration("set", Opcode.ldrdt, 0xf007, 0xf0ff, [ new Argument(ArgumentType.register, 8), new Argument(ArgumentType.dt) ]),
    new InstructionDeclaration("set", Opcode.lddtr, 0xf015, 0xf0ff, [ new Argument(ArgumentType.dt), new Argument(ArgumentType.register, 8) ]),
    new InstructionDeclaration("set", Opcode.ldai, 0xa000, 0xf000, [ new Argument(ArgumentType.i), new Argument(ArgumentType.address, 0) ]),

    new InstructionDeclaration("set_random", Opcode.rnd, 0xc000, 0xf000, [ new Argument(ArgumentType.register, 8), new Argument(ArgumentType.byte, 0) ]),
    new InstructionDeclaration("set_character", Opcode.ldaf, 0xf029, 0xf0ff, [ new Argument(ArgumentType.i), new Argument(ArgumentType.register, 8) ]),

    new InstructionDeclaration("read_key", Opcode.ldkp, 0xf00a, 0xf0ff, [ new Argument(ArgumentType.register, 8) ]),

    new InstructionDeclaration("add", Opcode.addi, 0x7000, 0xf000, [ new Argument(ArgumentType.register, 8), new Argument(ArgumentType.byte, 0) ]),
    new InstructionDeclaration("add", Opcode.addr, 0x8004, 0xf00f, [ new Argument(ArgumentType.register, 8), new Argument(ArgumentType.register, 4) ]),
    new InstructionDeclaration("add", Opcode.addar, 0xf01e, 0xf0ff, [ new Argument(ArgumentType.i), new Argument(ArgumentType.register, 8) ]),

    new InstructionDeclaration("subtract", Opcode.sub, 0x8005, 0xf00f, [ new Argument(ArgumentType.register, 8), new Argument(ArgumentType.register, 4) ]),
    new InstructionDeclaration("subtract_reverse", Opcode.bus, 0x8007, 0xf00f, [ new Argument(ArgumentType.register, 8), new Argument(ArgumentType.register, 4) ]),

    new InstructionDeclaration("or", Opcode.or, 0x8001, 0xf00f, [ new Argument(ArgumentType.register, 8), new Argument(ArgumentType.register, 4) ]),
    new InstructionDeclaration("and", Opcode.and, 0x8002, 0xf00f, [ new Argument(ArgumentType.register, 8), new Argument(ArgumentType.register, 4) ]),
    new InstructionDeclaration("xor", Opcode.xor, 0x8003, 0xf00f, [ new Argument(ArgumentType.register, 8), new Argument(ArgumentType.register, 4) ]),

    new InstructionDeclaration("shift_right", Opcode.shr, 0x8006, 0xf00f, [ new Argument(ArgumentType.register, 8) ]),
    new InstructionDeclaration("shift_left", Opcode.shl, 0x800e, 0xf00f, [ new Argument(ArgumentType.register, 8) ]),

    new InstructionDeclaration("store_base10", Opcode.stbcd, 0xf033, 0xf0ff, [ new Argument(ArgumentType.register, 8) ]),
    new InstructionDeclaration("store_through", Opcode.stx, 0xf055, 0xf0ff, [ new Argument(ArgumentType.register, 8) ]),
    new InstructionDeclaration("load_through", Opcode.ldx, 0xf065, 0xf0ff, [ new Argument(ArgumentType.register, 8) ]),

    new InstructionDeclaration("jump", Opcode.j, 0x1000, 0xf000, [ new Argument(ArgumentType.address, 0) ]),
    new InstructionDeclaration("jump_plus_v0", Opcode.jo, 0xb000, 0xf000, [ new Argument(ArgumentType.address, 0) ]),

    new InstructionDeclaration("return", Opcode.ret, 0x00ee, 0xffff, []),
    new InstructionDeclaration("call", Opcode.call, 0x2000, 0xf000, [ new Argument(ArgumentType.address, 0) ]),

    new InstructionDeclaration("skip_equal", Opcode.seq, 0x3000, 0xf000, [ new Argument(ArgumentType.register, 8), new Argument(ArgumentType.byte, 0) ]),
    new InstructionDeclaration("skip_equal", Opcode.seqr, 0x5000, 0xf00f, [ new Argument(ArgumentType.register, 8), new Argument(ArgumentType.register, 4) ]),
    new InstructionDeclaration("skip_not_equal", Opcode.sneq, 0x4000, 0xf000, [ new Argument(ArgumentType.register, 8), new Argument(ArgumentType.byte, 0) ]),
    new InstructionDeclaration("skip_not_equal", Opcode.sneqr, 0x9000, 0xf00f, [ new Argument(ArgumentType.register, 8), new Argument(ArgumentType.register, 0) ]),

    new InstructionDeclaration("skip_key_pressed", Opcode.skp, 0xe09e, 0xf0ff, [ new Argument(ArgumentType.register, 8) ]),
    new InstructionDeclaration("skip_key_not_pressed", Opcode.sknp, 0xe0a1, 0xf0ff, [ new Argument(ArgumentType.register, 8) ]),

    // In case of no match (e.g. non-code data)
    new InstructionDeclaration("raw", Opcode.raw, 0x0000, 0x0000, [ new Argument(ArgumentType.word, 0) ])
];

var instructionNameToDeclarations = {};
for (var i = 0; i < instructionSet.length; i++) {
    var declaration = instructionSet[i];
    var name = declaration.name;
    if (!instructionNameToDeclarations[name]) {
        instructionNameToDeclarations[name] = [];
    }

    instructionNameToDeclarations[name].push(declaration);
}

function isValidNumber(str) {
    var value = parseInt(str);
    return value !== NaN && value >= 0 && value <= 0xffff;
}

function parseArgument(str) {
    var argumentType = argumentToUniqueType[str];
    if (argumentType) {
        return {
            class: ArgumentClass.unique,
            type: argumentType
        };
    } else if (str[0] === "V" && ((str[1] >= "0" && str[1] <= "9") || (str[1] >= "A" && str[1] <= "F"))) {
        return {
            class: ArgumentClass.unique,
            type: ArgumentType.register,
            value: parseInt(str[1], 16)
        };
    } else if (isValidNumber(str)) {
        return {
            class: ArgumentClass.number,
            value: parseInt(str)
        };
    } else {
        throw "Invalid argument: " + str;
    }
}

function assembleInstruction(str) {
    var tokens = str.split(/\s+/);
    var instructionName = tokens[0];
    var instructions = instructionNameToDeclarations[instructionName];
    if (!instructions) {
        throw "Unknown instruction name: " + instructionName;
    }

    var arguments = [];
    for (var i = 1; i < tokens.length; i++) {
        arguments.push(parseArgument(tokens[i]));
    }

    // Find the specific opcode by looking at argument types
    var matched = false;
    var instruction;
    for (var i = 0; i < instructions.length; i++) {
        instruction = instructions[i];
        if (instruction.arguments.length === arguments.length) {
            var valid = true;
            for (var j = 0; j < arguments.length; j++) {
                var argument = arguments[j];
                var expectedArgumentType = instruction.arguments[j].type;
                switch (argument.class) {
                    case ArgumentClass.unique:
                    valid = (argument.type === expectedArgumentType);
                    break;

                    case ArgumentClass.number:
                    valid = (argumentTypeToClass[expectedArgumentType] == ArgumentClass.number)
                        && (argument.value < (1 << argumentTypeToBits[expectedArgumentType])); // Ensure the number fits
                    break;
                }

                if (!valid) {
                    break;
                }
            }

            if (valid) {
                matched = true;
                break;
            }
        }
    }

    if (!matched) {
        throw "No instance of " + instructionName + " matches argument types for: " + str;
    }

    var word = instruction.encoding;
    for (var i = 0; i < instruction.arguments.length; i++) {
        var argument = arguments[i];
        var instructionArgument = instruction.arguments[i];
        if (instructionArgument.position !== undefined) {
            word |= (argument.value) << instructionArgument.position;
        }
    }

    return word;
}

function disassembleInstruction(word) {

}

// Main
if (process.argv.length == 4) {
    var command = process.argv[2];
    var argument = process.argv[3];
    if (command === "encode") {
        console.log(assembleInstruction(argument).toString(16));
    } else if (command === "parse") {
        console.log(disassembleInstruction(parseInt(argument, 16)));
    }
} else {
    console.log("USAGE: <program> <assemble/disassemble> <instruction>");
}
