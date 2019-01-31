(function (document) {
    function createArray(size) {
        var array = [];
        for (var i = 0; i < size; i ++) {
            array[i] = 0;
        }
        return array;
    }

    function createTable(id, values, columns, rows, total) {
        var table = document.getElementById(id);
        var tds = [];
        for (var i = 0; i < rows; i++) {
            var tr = document.createElement("tr");
            for (var j = 0; j < columns; j++) {
                var index = i * columns + j;
                if (index && index >= total) {
                    break;
                }

                var td = document.createElement("td");
                td.innerText = values[index];
                tds[index] = td;
                tr.appendChild(td);
            }

            table.appendChild(tr);
        }

        return tds;
    }

    var displayWidth = 64;
    var displayHeight = 32;

    function set(array, index, value) {
        array[index] = value;
        array.table[index].innerText = value;
    }

    function setxy(array, x, y, value) {
        set(array, y * displayWidth + x, value);
    }

    function get(array, index) {
        return array[index];
    }

    function getxy(array, x, y) {
        return array[y * displayWidth + x];
    }

    function get16(array, index) {
        return (array[index] << 8) | (array[index + 1]);
    }

    // Registers
    // 0 - 14 are unnamed (8 bits each)
    var VF = 15;    // Used for carry flag (8 bits)
    var DT = 16;    // Delay timer (60 Hz) (8 bits)
    var ST = 17;    // Sound timer (60 Hz) (8 bits)
    var SP = 18;    // Stack pointer (8 bits)
    var I = 19;     // Address register (16 bits)
    var PC = 20;    // Program counter (16 bits)

    var registers = createArray(18);
    var stack = createArray(32); // 16 bits each
    var memory = createArray(4096); // 8 bits each
    var display = createArray(displayWidth * displayHeight); // 1 bit each
    var keys = createArray(16);

    function clearArray(array) {
        for (var i = 0; i < array.length; i++) {
            set(array, i, 0);
        }
    }

    function reset() {
        clearArray(registers);
        clearArray(stack);
        clearArray(memory);
        clearArray(display);
        clearArray(keys);

        set(registers, PC, 0x200);
    }

    registers.table = createTable("chip8_registers", registers, 16, 2, registers.length)
    stack.table = createTable("chip8_stack", registers, 16, 2)
    memory.table = createTable("chip8_memory", memory, 64, 64);
    display.table = createTable("chip8_display", display, displayWidth, displayHeight);

    // TODO: timers
    // TODO: input
    // TODO: display
    // TODO: sound

    function process() {
        var pc = get16(registers, PC);
        var instruction = get16(memory, pc);
        set(registers, PC, pc + 1)

        switch ((instruction >> 12) & 0xf) {
            case 0:
            {
                switch (instruction) {
                    // CLS
                    case 0x00e0:
                    clearArray(display);
                    break;

                    // RET
                    case 0x00ee:
                    var sp = get(regsiters, sp);
                    set(registers, PC, get(stack, sp));
                    set(registers, SP, sp - 1);
                    break;
                }
            }
            break;

            // JP
            case 1:
            {
                var address = instruction & 0xfff;
                set(registers, PC, address);
            }
            break;

            // CALL
            case 2:
            {
                var address = instruction & 0xfff;
                var sp = get(registers, SP);
                set(stack, sp, pc);
                set(registers, SP, sp + 1);
                set(registers, PC, address);
            }
            break;

            // SE
            case 3:
            {
                var r = (instruction >> 8) & 0xf;
                var a = instruction & 0xff;
                var b = get(registers, r);
                if (a === b) {
                    set(registers, PC, pc + 2);
                }
            }
            break;

            // SNE
            case 4:
            {
                var r = (instruction >> 8) & 0xf;
                var a = instruction & 0xff;
                var b = get(registers, r);
                if (a !== b) {
                    set(registers, PC, pc + 2);
                }
            }
            break;

            // SER
            case 5:
            {
                var ra = (instruction >> 8) & 0xf;
                var rb = (instruction >> 4) & 0xf;
                var a = get(registers, ra);
                var b = get(registers, rb);
                if (a === b) {
                    set(registers, PC, pc + 2);
                }
            }
            break;

            // LD
            case 6:
            {
                var r = (instruction >> 8) & 0xf;
                var v = instruction & 0xff;
                set(registers, r, v);
            }
            break;

            // ADD
            case 7:
            {
                var r = (instruction >> 8) & 0xf;
                var rv = get(registers, r);
                var v = instruction & 0xff;
                var result = rv + v;
                set(registers, r, result & 0xff);
                set(registers, vf, (result > 0xff) ? 1 : 0);
            }
            break;

            case 8:
            {
                switch (instruction & 0xf) {
                    // LDR
                    case 0:
                    {
                        var ra = (instruction >> 8) & 0xf;
                        var rb = (instruction >> 4) & 0xf;
                        var rbv = get(registers, rb);
                        set(registers, ra, rbv);
                    }
                    break;

                    // ORR
                    case 1:
                    {
                        var ra = (instruction >> 8) & 0xf;
                        var rav = get(registers, ra);
                        var rb = (instruction >> 4) & 0xf;
                        var rbv = get(registers, rb);
                        set(registers, ra, rav | rbv);
                    }
                    break;

                    // ANDR
                    case 2:
                    {
                        var ra = (instruction >> 8) & 0xf;
                        var rav = get(registers, ra);
                        var rb = (instruction >> 4) & 0xf;
                        var rbv = get(registers, rb);
                        set(registers, ra, rav & rbv);
                    }
                    break;

                    // XORR
                    case 3:
                    {
                        var ra = (instruction >> 8) & 0xf;
                        var rav = get(registers, ra);
                        var rb = (instruction >> 4) & 0xf;
                        var rbv = get(registers, rb);
                        set(registers, ra, rav ^ rbv);
                    }
                    break;

                    // ADDR
                    case 4:
                    {
                        var ra = (instruction >> 8) & 0xf;
                        var rav = get(registers, ra);
                        var rb = (instruction >> 4) & 0xf;
                        var rbv = get(registers, rb);
                        var result = rav + rbv;
                        set(registers, ra, result & 0xff);
                        set(registers, vf, (result > 0xff) ? 1 : 0);
                    }
                    break;

                    // SUBR
                    case 5:
                    {
                        var ra = (instruction >> 8) & 0xf;
                        var rav = get(registers, ra);
                        var rb = (instruction >> 4) & 0xf;
                        var rbv = get(registers, rb);
                        var result = rav - rbv;
                        set(registers, ra, result & 0xff);
                        set(registers, vf, rav > rbv);
                    }
                    break;

                    // SHR
                    case 6:
                    {
                        var r = (instruction >> 8) & 0xf;
                        var rv = get(registers, r);
                        set(registers, r, rv >> 1);
                        set(registers, vf, rv & 0x1);
                    }
                    break;

                    // BUSR
                    case 7:
                    {
                        var ra = (instruction >> 8) & 0xf;
                        var rav = get(registers, ra);
                        var rb = (instruction >> 4) & 0xf;
                        var rbv = get(registers, rb);
                        var result = rbv - rav;
                        set(registers, ra, result & 0xff);
                        set(registers, vf, rbv > rav);
                    }
                    break;

                    // SHL
                    case 0xe:
                    {
                        var r = (instruction >> 8) & 0xf;
                        var rv = get(registers, r);
                        set(registers, r, rv << 1);
                        set(registers, vf, (rv & 0x80) ? 1 :0);
                    }
                    break;
                }
            }
            break;

            // SNER
            case 9:
            {
                var ra = (instruction >> 8) & 0xf;
                var rb = (instruction >> 4) & 0xf;
                var a = get(registers, ra);
                var b = get(registers, rb);
                if (a !== b) {
                    set(registers, PC, pc + 2);
                }
            }
            break;

            // LDI
            case 0xa:
            {
                var address = instruction & 0xfff;
                set(registers, I, address);
            }
            break;

            // JPR
            case 0xb:
            {
                var address = instruction & 0xfff;
                var r0v = get(registers, 0);
                set(registers, PC, address + r0v);
            }
            break;

            // RND
            case 0xc:
            {
                var r = (instruction >> 8) & 0xf;
                var v = instruction & 0xff;
                var random = Math.floor(Math.random() * 256);
                set(registers, r, random & v);
            }
            break;

            // DRW
            case 0xd:
            {
                var ra = (instruction >> 8) & 0xf;
                var rb = (instruction >> 4) & 0xf;
                var bytes = instruction & 0xf;
                var spriteAddress = get(registers, I);
                var x0 = get(registers, ra);
                var y0 = get(registers, rb);
                var collided = false;
                for (var byte = 0; byte < bytes; byte++) {
                    for (var i = 0; i < 8; i++) {
                        var x = x0 + i;
                        var y = y0 + byte;
                        var pixel_destination = getxy(display, x, y);
                        var pixel_source = get(memory, spriteAddress + i + 8 * byte);
                        setxy(display, x, y, pixel_destination ^ pixel_source);
                        if (pixel_destination && pixel_source) {
                            collided = true;
                        }
                    }
                }
            }
            break;

            case 0xe:
            {
                switch (instruction & 0xff) {
                    // SKP
                    case 0x9e:
                    {
                        var r = (instruction >> 8) & 0xf;
                        var key = get(keys, r);
                        if (key) {
                            set(registers, PC, pc + 2);
                        }
                    }
                    break;

                    // SKNP
                    case 0xa1:
                    {
                        var r = (instruction >> 8) & 0xf;
                        var key = get(keys, r);
                        if (!key) {
                            set(registers, PC, pc + 2);
                        }
                    }
                    break;
                }
            }
            break;

            case 0xf:
            {
                switch (instruction & 0xf0ff) {
                    // LDD
                    case 0x07:
                    {
                        var ra = (instruction >> 8) & 0xf;
                        var rdv = get(registers, DT);
                        set(registers, ra, rdv);
                    }
                    break;

                    // LDK
                    case 0x0a:
                    // TODO: Input
                    break;

                    // STDR
                    case 0x15:
                    {
                        var r = (instruction >> 8) & 0xf;
                        var rv = get(registers, r);
                        set(registers, DT, rv);
                    }
                    break;

                    // STSR
                    case 0x18:
                    {
                        var r = (instruction >> 8) & 0xf;
                        var rv = get(registers, r);
                        set(registers, ST, rv);
                    }
                    break;

                    // ADDAR
                    case 0x1e:
                    {
                        var r = (instruction >> 8) & 0xf;
                        var rv = get(registers, r);
                        var i = get(registers, I);
                        set(memory, I, i + rv);
                    }
                    break;

                    // LDIFR
                    case 0x29:
                    // TODO: Fonts
                    break;

                    // STIBR
                    case 0x33:
                    {
                        var r = (instruction >> 8) & 0xf;
                        var rv = get(registers, r);
                        var i = get(registers, I);
                        set(memory, i, Math.floor(rv / 100));
                        set(memory, i + 1, Math.floor((rv % 100) / 10));
                        set(memory, i + 2, rv % 10);
                    }
                    break;

                    // STX
                    case 0x55:
                    {
                        var i = get(registers, I);
                        for (var j = 0; j < 16; j++) {
                            set(memory, i + j, get(registers, j));
                        }
                    }
                    break;

                    // LDX
                    case 0x65:
                    {
                        var i = get(registers, I);
                        for (var j = 0; j < 16; j++) {
                            set(registers, j, get(memory, i + j));
                        }
                    }
                    break;
                }
            }
            break;
        }

        // TODO: Decrement timers, if needed
    }

    document.getElementById("chip8_button_step").onclick = function () {
        process();
    };

    document.getElementById("chip8_button_reset").onclick = function () {
        reset();
    };
})(document);