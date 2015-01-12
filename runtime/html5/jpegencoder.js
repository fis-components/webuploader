/**
 * 这个方式性能不行，但是可以解决android里面的toDataUrl的bug
 * android里面toDataUrl('image/jpege')得到的结果却是png.
 *
 * 所以这里没辙，只能借助这个工具
 * @fileOverview jpeg encoder
 */


/*
      Copyright (c) 2008, Adobe Systems Incorporated
      All rights reserved.

      Redistribution and use in source and binary forms, with or without
      modification, are permitted provided that the following conditions are
      met:

      * Redistributions of source code must retain the above copyright notice,
        this list of conditions and the following disclaimer.

      * Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.

      * Neither the name of Adobe Systems Incorporated nor the names of its
        contributors may be used to endorse or promote products derived from
        this software without specific prior written permission.

      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
      IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
      THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
      PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
      CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
      EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
      PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
      PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
      LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
      NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
      SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    */
/*
    JPEG encoder ported to JavaScript and optimized by Andreas Ritter, www.bytestrom.eu, 11/2009

    Basic GUI blocking jpeg encoder
    */
function JPEGEncoder(quality) {
    var self = this;
    var fround = Math.round;
    var ffloor = Math.floor;
    var YTable = new Array(64);
    var UVTable = new Array(64);
    var fdtbl_Y = new Array(64);
    var fdtbl_UV = new Array(64);
    var YDC_HT;
    var UVDC_HT;
    var YAC_HT;
    var UVAC_HT;
    var bitcode = new Array(65535);
    var category = new Array(65535);
    var outputfDCTQuant = new Array(64);
    var DU = new Array(64);
    var byteout = [];
    var bytenew = 0;
    var bytepos = 7;
    var YDU = new Array(64);
    var UDU = new Array(64);
    var VDU = new Array(64);
    var clt = new Array(256);
    var RGB_YUV_TABLE = new Array(2048);
    var currentQuality;
    var ZigZag = [
        0,
        1,
        5,
        6,
        14,
        15,
        27,
        28,
        2,
        4,
        7,
        13,
        16,
        26,
        29,
        42,
        3,
        8,
        12,
        17,
        25,
        30,
        41,
        43,
        9,
        11,
        18,
        24,
        31,
        40,
        44,
        53,
        10,
        19,
        23,
        32,
        39,
        45,
        52,
        54,
        20,
        22,
        33,
        38,
        46,
        51,
        55,
        60,
        21,
        34,
        37,
        47,
        50,
        56,
        59,
        61,
        35,
        36,
        48,
        49,
        57,
        58,
        62,
        63
    ];
    var std_dc_luminance_nrcodes = [
        0,
        0,
        1,
        5,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ];
    var std_dc_luminance_values = [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11
    ];
    var std_ac_luminance_nrcodes = [
        0,
        0,
        2,
        1,
        3,
        3,
        2,
        4,
        3,
        5,
        5,
        4,
        4,
        0,
        0,
        1,
        125
    ];
    var std_ac_luminance_values = [
        1,
        2,
        3,
        0,
        4,
        17,
        5,
        18,
        33,
        49,
        65,
        6,
        19,
        81,
        97,
        7,
        34,
        113,
        20,
        50,
        129,
        145,
        161,
        8,
        35,
        66,
        177,
        193,
        21,
        82,
        209,
        240,
        36,
        51,
        98,
        114,
        130,
        9,
        10,
        22,
        23,
        24,
        25,
        26,
        37,
        38,
        39,
        40,
        41,
        42,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74,
        83,
        84,
        85,
        86,
        87,
        88,
        89,
        90,
        99,
        100,
        101,
        102,
        103,
        104,
        105,
        106,
        115,
        116,
        117,
        118,
        119,
        120,
        121,
        122,
        131,
        132,
        133,
        134,
        135,
        136,
        137,
        138,
        146,
        147,
        148,
        149,
        150,
        151,
        152,
        153,
        154,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        178,
        179,
        180,
        181,
        182,
        183,
        184,
        185,
        186,
        194,
        195,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        210,
        211,
        212,
        213,
        214,
        215,
        216,
        217,
        218,
        225,
        226,
        227,
        228,
        229,
        230,
        231,
        232,
        233,
        234,
        241,
        242,
        243,
        244,
        245,
        246,
        247,
        248,
        249,
        250
    ];
    var std_dc_chrominance_nrcodes = [
        0,
        0,
        3,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        0,
        0,
        0,
        0,
        0
    ];
    var std_dc_chrominance_values = [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11
    ];
    var std_ac_chrominance_nrcodes = [
        0,
        0,
        2,
        1,
        2,
        4,
        4,
        3,
        4,
        7,
        5,
        4,
        4,
        0,
        1,
        2,
        119
    ];
    var std_ac_chrominance_values = [
        0,
        1,
        2,
        3,
        17,
        4,
        5,
        33,
        49,
        6,
        18,
        65,
        81,
        7,
        97,
        113,
        19,
        34,
        50,
        129,
        8,
        20,
        66,
        145,
        161,
        177,
        193,
        9,
        35,
        51,
        82,
        240,
        21,
        98,
        114,
        209,
        10,
        22,
        36,
        52,
        225,
        37,
        241,
        23,
        24,
        25,
        26,
        38,
        39,
        40,
        41,
        42,
        53,
        54,
        55,
        56,
        57,
        58,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74,
        83,
        84,
        85,
        86,
        87,
        88,
        89,
        90,
        99,
        100,
        101,
        102,
        103,
        104,
        105,
        106,
        115,
        116,
        117,
        118,
        119,
        120,
        121,
        122,
        130,
        131,
        132,
        133,
        134,
        135,
        136,
        137,
        138,
        146,
        147,
        148,
        149,
        150,
        151,
        152,
        153,
        154,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        178,
        179,
        180,
        181,
        182,
        183,
        184,
        185,
        186,
        194,
        195,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        210,
        211,
        212,
        213,
        214,
        215,
        216,
        217,
        218,
        226,
        227,
        228,
        229,
        230,
        231,
        232,
        233,
        234,
        242,
        243,
        244,
        245,
        246,
        247,
        248,
        249,
        250
    ];
    function initQuantTables(sf) {
        var YQT = [
            16,
            11,
            10,
            16,
            24,
            40,
            51,
            61,
            12,
            12,
            14,
            19,
            26,
            58,
            60,
            55,
            14,
            13,
            16,
            24,
            40,
            57,
            69,
            56,
            14,
            17,
            22,
            29,
            51,
            87,
            80,
            62,
            18,
            22,
            37,
            56,
            68,
            109,
            103,
            77,
            24,
            35,
            55,
            64,
            81,
            104,
            113,
            92,
            49,
            64,
            78,
            87,
            103,
            121,
            120,
            101,
            72,
            92,
            95,
            98,
            112,
            100,
            103,
            99
        ];
        for (var i = 0; i < 64; i++) {
            var t = ffloor((YQT[i] * sf + 50) / 100);
            if (t < 1) {
                t = 1;
            } else if (t > 255) {
                t = 255;
            }
            YTable[ZigZag[i]] = t;
        }
        var UVQT = [
            17,
            18,
            24,
            47,
            99,
            99,
            99,
            99,
            18,
            21,
            26,
            66,
            99,
            99,
            99,
            99,
            24,
            26,
            56,
            99,
            99,
            99,
            99,
            99,
            47,
            66,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99
        ];
        for (var j = 0; j < 64; j++) {
            var u = ffloor((UVQT[j] * sf + 50) / 100);
            if (u < 1) {
                u = 1;
            } else if (u > 255) {
                u = 255;
            }
            UVTable[ZigZag[j]] = u;
        }
        var aasf = [
            1,
            1.387039845,
            1.306562965,
            1.175875602,
            1,
            0.785694958,
            0.5411961,
            0.275899379
        ];
        var k = 0;
        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
                fdtbl_Y[k] = 1 / (YTable[ZigZag[k]] * aasf[row] * aasf[col] * 8);
                fdtbl_UV[k] = 1 / (UVTable[ZigZag[k]] * aasf[row] * aasf[col] * 8);
                k++;
            }
        }
    }
    function computeHuffmanTbl(nrcodes, std_table) {
        var codevalue = 0;
        var pos_in_table = 0;
        var HT = new Array();
        for (var k = 1; k <= 16; k++) {
            for (var j = 1; j <= nrcodes[k]; j++) {
                HT[std_table[pos_in_table]] = [];
                HT[std_table[pos_in_table]][0] = codevalue;
                HT[std_table[pos_in_table]][1] = k;
                pos_in_table++;
                codevalue++;
            }
            codevalue *= 2;
        }
        return HT;
    }
    function initHuffmanTbl() {
        YDC_HT = computeHuffmanTbl(std_dc_luminance_nrcodes, std_dc_luminance_values);
        UVDC_HT = computeHuffmanTbl(std_dc_chrominance_nrcodes, std_dc_chrominance_values);
        YAC_HT = computeHuffmanTbl(std_ac_luminance_nrcodes, std_ac_luminance_values);
        UVAC_HT = computeHuffmanTbl(std_ac_chrominance_nrcodes, std_ac_chrominance_values);
    }
    function initCategoryNumber() {
        var nrlower = 1;
        var nrupper = 2;
        for (var cat = 1; cat <= 15; cat++) {
            //Positive numbers
            for (var nr = nrlower; nr < nrupper; nr++) {
                category[32767 + nr] = cat;
                bitcode[32767 + nr] = [];
                bitcode[32767 + nr][1] = cat;
                bitcode[32767 + nr][0] = nr;
            }
            //Negative numbers
            for (var nrneg = -(nrupper - 1); nrneg <= -nrlower; nrneg++) {
                category[32767 + nrneg] = cat;
                bitcode[32767 + nrneg] = [];
                bitcode[32767 + nrneg][1] = cat;
                bitcode[32767 + nrneg][0] = nrupper - 1 + nrneg;
            }
            nrlower <<= 1;
            nrupper <<= 1;
        }
    }
    function initRGBYUVTable() {
        for (var i = 0; i < 256; i++) {
            RGB_YUV_TABLE[i] = 19595 * i;
            RGB_YUV_TABLE[i + 256 >> 0] = 38470 * i;
            RGB_YUV_TABLE[i + 512 >> 0] = 7471 * i + 32768;
            RGB_YUV_TABLE[i + 768 >> 0] = -11059 * i;
            RGB_YUV_TABLE[i + 1024 >> 0] = -21709 * i;
            RGB_YUV_TABLE[i + 1280 >> 0] = 32768 * i + 8421375;
            RGB_YUV_TABLE[i + 1536 >> 0] = -27439 * i;
            RGB_YUV_TABLE[i + 1792 >> 0] = -5329 * i;
        }
    }
    // IO functions
    function writeBits(bs) {
        var value = bs[0];
        var posval = bs[1] - 1;
        while (posval >= 0) {
            if (value & 1 << posval) {
                bytenew |= 1 << bytepos;
            }
            posval--;
            bytepos--;
            if (bytepos < 0) {
                if (bytenew == 255) {
                    writeByte(255);
                    writeByte(0);
                } else {
                    writeByte(bytenew);
                }
                bytepos = 7;
                bytenew = 0;
            }
        }
    }
    function writeByte(value) {
        byteout.push(clt[value]);    // write char directly instead of converting later
    }
    function writeWord(value) {
        writeByte(value >> 8 & 255);
        writeByte(value & 255);
    }
    // DCT & quantization core
    function fDCTQuant(data, fdtbl) {
        var d0, d1, d2, d3, d4, d5, d6, d7;
        /* Pass 1: process rows. */
        var dataOff = 0;
        var i;
        var I8 = 8;
        var I64 = 64;
        for (i = 0; i < I8; ++i) {
            d0 = data[dataOff];
            d1 = data[dataOff + 1];
            d2 = data[dataOff + 2];
            d3 = data[dataOff + 3];
            d4 = data[dataOff + 4];
            d5 = data[dataOff + 5];
            d6 = data[dataOff + 6];
            d7 = data[dataOff + 7];
            var tmp0 = d0 + d7;
            var tmp7 = d0 - d7;
            var tmp1 = d1 + d6;
            var tmp6 = d1 - d6;
            var tmp2 = d2 + d5;
            var tmp5 = d2 - d5;
            var tmp3 = d3 + d4;
            var tmp4 = d3 - d4;
            /* Even part */
            var tmp10 = tmp0 + tmp3;
            /* phase 2 */
            var tmp13 = tmp0 - tmp3;
            var tmp11 = tmp1 + tmp2;
            var tmp12 = tmp1 - tmp2;
            data[dataOff] = tmp10 + tmp11;
            /* phase 3 */
            data[dataOff + 4] = tmp10 - tmp11;
            var z1 = (tmp12 + tmp13) * 0.707106781;
            /* c4 */
            data[dataOff + 2] = tmp13 + z1;
            /* phase 5 */
            data[dataOff + 6] = tmp13 - z1;
            /* Odd part */
            tmp10 = tmp4 + tmp5;
            /* phase 2 */
            tmp11 = tmp5 + tmp6;
            tmp12 = tmp6 + tmp7;
            /* The rotator is modified from fig 4-8 to avoid extra negations. */
            var z5 = (tmp10 - tmp12) * 0.382683433;
            /* c6 */
            var z2 = 0.5411961 * tmp10 + z5;
            /* c2-c6 */
            var z4 = 1.306562965 * tmp12 + z5;
            /* c2+c6 */
            var z3 = tmp11 * 0.707106781;
            /* c4 */
            var z11 = tmp7 + z3;
            /* phase 5 */
            var z13 = tmp7 - z3;
            data[dataOff + 5] = z13 + z2;
            /* phase 6 */
            data[dataOff + 3] = z13 - z2;
            data[dataOff + 1] = z11 + z4;
            data[dataOff + 7] = z11 - z4;
            dataOff += 8;    /* advance pointer to next row */
        }
        /* Pass 2: process columns. */
        dataOff = 0;
        for (i = 0; i < I8; ++i) {
            d0 = data[dataOff];
            d1 = data[dataOff + 8];
            d2 = data[dataOff + 16];
            d3 = data[dataOff + 24];
            d4 = data[dataOff + 32];
            d5 = data[dataOff + 40];
            d6 = data[dataOff + 48];
            d7 = data[dataOff + 56];
            var tmp0p2 = d0 + d7;
            var tmp7p2 = d0 - d7;
            var tmp1p2 = d1 + d6;
            var tmp6p2 = d1 - d6;
            var tmp2p2 = d2 + d5;
            var tmp5p2 = d2 - d5;
            var tmp3p2 = d3 + d4;
            var tmp4p2 = d3 - d4;
            /* Even part */
            var tmp10p2 = tmp0p2 + tmp3p2;
            /* phase 2 */
            var tmp13p2 = tmp0p2 - tmp3p2;
            var tmp11p2 = tmp1p2 + tmp2p2;
            var tmp12p2 = tmp1p2 - tmp2p2;
            data[dataOff] = tmp10p2 + tmp11p2;
            /* phase 3 */
            data[dataOff + 32] = tmp10p2 - tmp11p2;
            var z1p2 = (tmp12p2 + tmp13p2) * 0.707106781;
            /* c4 */
            data[dataOff + 16] = tmp13p2 + z1p2;
            /* phase 5 */
            data[dataOff + 48] = tmp13p2 - z1p2;
            /* Odd part */
            tmp10p2 = tmp4p2 + tmp5p2;
            /* phase 2 */
            tmp11p2 = tmp5p2 + tmp6p2;
            tmp12p2 = tmp6p2 + tmp7p2;
            /* The rotator is modified from fig 4-8 to avoid extra negations. */
            var z5p2 = (tmp10p2 - tmp12p2) * 0.382683433;
            /* c6 */
            var z2p2 = 0.5411961 * tmp10p2 + z5p2;
            /* c2-c6 */
            var z4p2 = 1.306562965 * tmp12p2 + z5p2;
            /* c2+c6 */
            var z3p2 = tmp11p2 * 0.707106781;
            /* c4 */
            var z11p2 = tmp7p2 + z3p2;
            /* phase 5 */
            var z13p2 = tmp7p2 - z3p2;
            data[dataOff + 40] = z13p2 + z2p2;
            /* phase 6 */
            data[dataOff + 24] = z13p2 - z2p2;
            data[dataOff + 8] = z11p2 + z4p2;
            data[dataOff + 56] = z11p2 - z4p2;
            dataOff++;    /* advance pointer to next column */
        }
        // Quantize/descale the coefficients
        var fDCTQuant;
        for (i = 0; i < I64; ++i) {
            // Apply the quantization and scaling factor & Round to nearest integer
            fDCTQuant = data[i] * fdtbl[i];
            outputfDCTQuant[i] = fDCTQuant > 0 ? fDCTQuant + 0.5 | 0 : fDCTQuant - 0.5 | 0;    //outputfDCTQuant[i] = fround(fDCTQuant);
        }
        return outputfDCTQuant;
    }
    function writeAPP0() {
        writeWord(65504);
        // marker
        writeWord(16);
        // length
        writeByte(74);
        // J
        writeByte(70);
        // F
        writeByte(73);
        // I
        writeByte(70);
        // F
        writeByte(0);
        // = "JFIF",'\0'
        writeByte(1);
        // versionhi
        writeByte(1);
        // versionlo
        writeByte(0);
        // xyunits
        writeWord(1);
        // xdensity
        writeWord(1);
        // ydensity
        writeByte(0);
        // thumbnwidth
        writeByte(0);    // thumbnheight
    }
    function writeSOF0(width, height) {
        writeWord(65472);
        // marker
        writeWord(17);
        // length, truecolor YUV JPG
        writeByte(8);
        // precision
        writeWord(height);
        writeWord(width);
        writeByte(3);
        // nrofcomponents
        writeByte(1);
        // IdY
        writeByte(17);
        // HVY
        writeByte(0);
        // QTY
        writeByte(2);
        // IdU
        writeByte(17);
        // HVU
        writeByte(1);
        // QTU
        writeByte(3);
        // IdV
        writeByte(17);
        // HVV
        writeByte(1);    // QTV
    }
    function writeDQT() {
        writeWord(65499);
        // marker
        writeWord(132);
        // length
        writeByte(0);
        for (var i = 0; i < 64; i++) {
            writeByte(YTable[i]);
        }
        writeByte(1);
        for (var j = 0; j < 64; j++) {
            writeByte(UVTable[j]);
        }
    }
    function writeDHT() {
        writeWord(65476);
        // marker
        writeWord(418);
        // length
        writeByte(0);
        // HTYDCinfo
        for (var i = 0; i < 16; i++) {
            writeByte(std_dc_luminance_nrcodes[i + 1]);
        }
        for (var j = 0; j <= 11; j++) {
            writeByte(std_dc_luminance_values[j]);
        }
        writeByte(16);
        // HTYACinfo
        for (var k = 0; k < 16; k++) {
            writeByte(std_ac_luminance_nrcodes[k + 1]);
        }
        for (var l = 0; l <= 161; l++) {
            writeByte(std_ac_luminance_values[l]);
        }
        writeByte(1);
        // HTUDCinfo
        for (var m = 0; m < 16; m++) {
            writeByte(std_dc_chrominance_nrcodes[m + 1]);
        }
        for (var n = 0; n <= 11; n++) {
            writeByte(std_dc_chrominance_values[n]);
        }
        writeByte(17);
        // HTUACinfo
        for (var o = 0; o < 16; o++) {
            writeByte(std_ac_chrominance_nrcodes[o + 1]);
        }
        for (var p = 0; p <= 161; p++) {
            writeByte(std_ac_chrominance_values[p]);
        }
    }
    function writeSOS() {
        writeWord(65498);
        // marker
        writeWord(12);
        // length
        writeByte(3);
        // nrofcomponents
        writeByte(1);
        // IdY
        writeByte(0);
        // HTY
        writeByte(2);
        // IdU
        writeByte(17);
        // HTU
        writeByte(3);
        // IdV
        writeByte(17);
        // HTV
        writeByte(0);
        // Ss
        writeByte(63);
        // Se
        writeByte(0);    // Bf
    }
    function processDU(CDU, fdtbl, DC, HTDC, HTAC) {
        var EOB = HTAC[0];
        var M16zeroes = HTAC[240];
        var pos;
        var I16 = 16;
        var I63 = 63;
        var I64 = 64;
        var DU_DCT = fDCTQuant(CDU, fdtbl);
        //ZigZag reorder
        for (var j = 0; j < I64; ++j) {
            DU[ZigZag[j]] = DU_DCT[j];
        }
        var Diff = DU[0] - DC;
        DC = DU[0];
        //Encode DC
        if (Diff == 0) {
            writeBits(HTDC[0]);    // Diff might be 0
        } else {
            pos = 32767 + Diff;
            writeBits(HTDC[category[pos]]);
            writeBits(bitcode[pos]);
        }
        //Encode ACs
        var end0pos = 63;
        // was const... which is crazy
        for (; end0pos > 0 && DU[end0pos] == 0; end0pos--) {
        }
        ;
        //end0pos = first element in reverse order !=0
        if (end0pos == 0) {
            writeBits(EOB);
            return DC;
        }
        var i = 1;
        var lng;
        while (i <= end0pos) {
            var startpos = i;
            for (; DU[i] == 0 && i <= end0pos; ++i) {
            }
            var nrzeroes = i - startpos;
            if (nrzeroes >= I16) {
                lng = nrzeroes >> 4;
                for (var nrmarker = 1; nrmarker <= lng; ++nrmarker)
                    writeBits(M16zeroes);
                nrzeroes = nrzeroes & 15;
            }
            pos = 32767 + DU[i];
            writeBits(HTAC[(nrzeroes << 4) + category[pos]]);
            writeBits(bitcode[pos]);
            i++;
        }
        if (end0pos != I63) {
            writeBits(EOB);
        }
        return DC;
    }
    function initCharLookupTable() {
        var sfcc = String.fromCharCode;
        for (var i = 0; i < 256; i++) {
            ///// ACHTUNG // 255
            clt[i] = sfcc(i);
        }
    }
    this.encode = function (image, quality)
        // image data object
        {
            // var time_start = new Date().getTime();
            if (quality)
                setQuality(quality);
            // Initialize bit writer
            byteout = new Array();
            bytenew = 0;
            bytepos = 7;
            // Add JPEG headers
            writeWord(65496);
            // SOI
            writeAPP0();
            writeDQT();
            writeSOF0(image.width, image.height);
            writeDHT();
            writeSOS();
            // Encode 8x8 macroblocks
            var DCY = 0;
            var DCU = 0;
            var DCV = 0;
            bytenew = 0;
            bytepos = 7;
            this.encode.displayName = '_encode_';
            var imageData = image.data;
            var width = image.width;
            var height = image.height;
            var quadWidth = width * 4;
            var tripleWidth = width * 3;
            var x, y = 0;
            var r, g, b;
            var start, p, col, row, pos;
            while (y < height) {
                x = 0;
                while (x < quadWidth) {
                    start = quadWidth * y + x;
                    p = start;
                    col = -1;
                    row = 0;
                    for (pos = 0; pos < 64; pos++) {
                        row = pos >> 3;
                        // /8
                        col = (pos & 7) * 4;
                        // %8
                        p = start + row * quadWidth + col;
                        if (y + row >= height) {
                            // padding bottom
                            p -= quadWidth * (y + 1 + row - height);
                        }
                        if (x + col >= quadWidth) {
                            // padding right
                            p -= x + col - quadWidth + 4;
                        }
                        r = imageData[p++];
                        g = imageData[p++];
                        b = imageData[p++];
                        /* // calculate YUV values dynamically
                        YDU[pos]=((( 0.29900)*r+( 0.58700)*g+( 0.11400)*b))-128; //-0x80
                        UDU[pos]=(((-0.16874)*r+(-0.33126)*g+( 0.50000)*b));
                        VDU[pos]=((( 0.50000)*r+(-0.41869)*g+(-0.08131)*b));
                        */
                        // use lookup table (slightly faster)
                        YDU[pos] = (RGB_YUV_TABLE[r] + RGB_YUV_TABLE[g + 256 >> 0] + RGB_YUV_TABLE[b + 512 >> 0] >> 16) - 128;
                        UDU[pos] = (RGB_YUV_TABLE[r + 768 >> 0] + RGB_YUV_TABLE[g + 1024 >> 0] + RGB_YUV_TABLE[b + 1280 >> 0] >> 16) - 128;
                        VDU[pos] = (RGB_YUV_TABLE[r + 1280 >> 0] + RGB_YUV_TABLE[g + 1536 >> 0] + RGB_YUV_TABLE[b + 1792 >> 0] >> 16) - 128;
                    }
                    DCY = processDU(YDU, fdtbl_Y, DCY, YDC_HT, YAC_HT);
                    DCU = processDU(UDU, fdtbl_UV, DCU, UVDC_HT, UVAC_HT);
                    DCV = processDU(VDU, fdtbl_UV, DCV, UVDC_HT, UVAC_HT);
                    x += 32;
                }
                y += 8;
            }
            ////////////////////////////////////////////////////////////////
            // Do the bit alignment of the EOI marker
            if (bytepos >= 0) {
                var fillbits = [];
                fillbits[1] = bytepos + 1;
                fillbits[0] = (1 << bytepos + 1) - 1;
                writeBits(fillbits);
            }
            writeWord(65497);
            //EOI
            var jpegDataUri = 'data:image/jpeg;base64,' + btoa(byteout.join(''));
            byteout = [];
            // benchmarking
            // var duration = new Date().getTime() - time_start;
            // console.log('Encoding time: '+ currentQuality + 'ms');
            //
            return jpegDataUri;
        };
    function setQuality(quality) {
        if (quality <= 0) {
            quality = 1;
        }
        if (quality > 100) {
            quality = 100;
        }
        if (currentQuality == quality)
            return;
        // don't recalc if unchanged
        var sf = 0;
        if (quality < 50) {
            sf = Math.floor(5000 / quality);
        } else {
            sf = Math.floor(200 - quality * 2);
        }
        initQuantTables(sf);
        currentQuality = quality;    // console.log('Quality set to: '+quality +'%');
    }
    function init() {
        // var time_start = new Date().getTime();
        if (!quality)
            quality = 50;
        // Create tables
        initCharLookupTable();
        initHuffmanTbl();
        initCategoryNumber();
        initRGBYUVTable();
        setQuality(quality);    // var duration = new Date().getTime() - time_start;
                                // console.log('Initialization '+ duration + 'ms');
    }
    init();
}
;
JPEGEncoder.encode = function (data, quality) {
    var encoder = new JPEGEncoder(quality);
    return encoder.encode(data);
};
module.exports = JPEGEncoder;;