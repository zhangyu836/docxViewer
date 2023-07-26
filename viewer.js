var docxViewer = (function (exports) {
            'use strict';

            var global$1 = (typeof global !== "undefined" ? global :
                        typeof self !== "undefined" ? self :
                        typeof window !== "undefined" ? window : {});

            var PI_OVER_180 = Math.PI / 180;
            function detectBrowser() {
                return (typeof window !== 'undefined' &&
                    ({}.toString.call(window) === '[object Window]' ||
                        {}.toString.call(window) === '[object global]'));
            }
            const glob = typeof global$1 !== 'undefined'
                ? global$1
                : typeof window !== 'undefined'
                    ? window
                    : typeof WorkerGlobalScope !== 'undefined'
                        ? self
                        : {};
            const Konva$2 = {
                _global: glob,
                version: '8.4.3',
                isBrowser: detectBrowser(),
                isUnminified: /param/.test(function (param) { }.toString()),
                dblClickWindow: 400,
                getAngle(angle) {
                    return Konva$2.angleDeg ? angle * PI_OVER_180 : angle;
                },
                enableTrace: false,
                pointerEventsEnabled: true,
                autoDrawEnabled: true,
                hitOnDragEnabled: false,
                capturePointerEventsEnabled: false,
                _mouseListenClick: false,
                _touchListenClick: false,
                _pointerListenClick: false,
                _mouseInDblClickWindow: false,
                _touchInDblClickWindow: false,
                _pointerInDblClickWindow: false,
                _mouseDblClickPointerId: null,
                _touchDblClickPointerId: null,
                _pointerDblClickPointerId: null,
                pixelRatio: (typeof window !== 'undefined' && window.devicePixelRatio) || 1,
                dragDistance: 3,
                angleDeg: true,
                showWarnings: true,
                dragButtons: [0, 1],
                isDragging() {
                    return Konva$2['DD'].isDragging;
                },
                isDragReady() {
                    return !!Konva$2['DD'].node;
                },
                releaseCanvasOnDestroy: true,
                document: glob.document,
                _injectGlobal(Konva) {
                    glob.Konva = Konva;
                },
            };
            const _registerNode = (NodeClass) => {
                Konva$2[NodeClass.prototype.getClassName()] = NodeClass;
            };
            Konva$2._injectGlobal(Konva$2);

            class Transform {
                constructor(m = [1, 0, 0, 1, 0, 0]) {
                    this.dirty = false;
                    this.m = (m && m.slice()) || [1, 0, 0, 1, 0, 0];
                }
                reset() {
                    this.m[0] = 1;
                    this.m[1] = 0;
                    this.m[2] = 0;
                    this.m[3] = 1;
                    this.m[4] = 0;
                    this.m[5] = 0;
                }
                copy() {
                    return new Transform(this.m);
                }
                copyInto(tr) {
                    tr.m[0] = this.m[0];
                    tr.m[1] = this.m[1];
                    tr.m[2] = this.m[2];
                    tr.m[3] = this.m[3];
                    tr.m[4] = this.m[4];
                    tr.m[5] = this.m[5];
                }
                point(point) {
                    var m = this.m;
                    return {
                        x: m[0] * point.x + m[2] * point.y + m[4],
                        y: m[1] * point.x + m[3] * point.y + m[5],
                    };
                }
                translate(x, y) {
                    this.m[4] += this.m[0] * x + this.m[2] * y;
                    this.m[5] += this.m[1] * x + this.m[3] * y;
                    return this;
                }
                scale(sx, sy) {
                    this.m[0] *= sx;
                    this.m[1] *= sx;
                    this.m[2] *= sy;
                    this.m[3] *= sy;
                    return this;
                }
                rotate(rad) {
                    var c = Math.cos(rad);
                    var s = Math.sin(rad);
                    var m11 = this.m[0] * c + this.m[2] * s;
                    var m12 = this.m[1] * c + this.m[3] * s;
                    var m21 = this.m[0] * -s + this.m[2] * c;
                    var m22 = this.m[1] * -s + this.m[3] * c;
                    this.m[0] = m11;
                    this.m[1] = m12;
                    this.m[2] = m21;
                    this.m[3] = m22;
                    return this;
                }
                getTranslation() {
                    return {
                        x: this.m[4],
                        y: this.m[5],
                    };
                }
                skew(sx, sy) {
                    var m11 = this.m[0] + this.m[2] * sy;
                    var m12 = this.m[1] + this.m[3] * sy;
                    var m21 = this.m[2] + this.m[0] * sx;
                    var m22 = this.m[3] + this.m[1] * sx;
                    this.m[0] = m11;
                    this.m[1] = m12;
                    this.m[2] = m21;
                    this.m[3] = m22;
                    return this;
                }
                multiply(matrix) {
                    var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
                    var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];
                    var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
                    var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];
                    var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
                    var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];
                    this.m[0] = m11;
                    this.m[1] = m12;
                    this.m[2] = m21;
                    this.m[3] = m22;
                    this.m[4] = dx;
                    this.m[5] = dy;
                    return this;
                }
                invert() {
                    var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
                    var m0 = this.m[3] * d;
                    var m1 = -this.m[1] * d;
                    var m2 = -this.m[2] * d;
                    var m3 = this.m[0] * d;
                    var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
                    var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
                    this.m[0] = m0;
                    this.m[1] = m1;
                    this.m[2] = m2;
                    this.m[3] = m3;
                    this.m[4] = m4;
                    this.m[5] = m5;
                    return this;
                }
                getMatrix() {
                    return this.m;
                }
                decompose() {
                    var a = this.m[0];
                    var b = this.m[1];
                    var c = this.m[2];
                    var d = this.m[3];
                    var e = this.m[4];
                    var f = this.m[5];
                    var delta = a * d - b * c;
                    let result = {
                        x: e,
                        y: f,
                        rotation: 0,
                        scaleX: 0,
                        scaleY: 0,
                        skewX: 0,
                        skewY: 0,
                    };
                    if (a != 0 || b != 0) {
                        var r = Math.sqrt(a * a + b * b);
                        result.rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
                        result.scaleX = r;
                        result.scaleY = delta / r;
                        result.skewX = (a * c + b * d) / delta;
                        result.skewY = 0;
                    }
                    else if (c != 0 || d != 0) {
                        var s = Math.sqrt(c * c + d * d);
                        result.rotation =
                            Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
                        result.scaleX = delta / s;
                        result.scaleY = s;
                        result.skewX = 0;
                        result.skewY = (a * c + b * d) / delta;
                    }
                    else ;
                    result.rotation = Util._getRotation(result.rotation);
                    return result;
                }
            }
            var OBJECT_ARRAY = '[object Array]', OBJECT_NUMBER = '[object Number]', OBJECT_STRING = '[object String]', OBJECT_BOOLEAN = '[object Boolean]', PI_OVER_DEG180 = Math.PI / 180, DEG180_OVER_PI = 180 / Math.PI, HASH$1 = '#', EMPTY_STRING$1 = '', ZERO = '0', KONVA_WARNING = 'Konva warning: ', KONVA_ERROR = 'Konva error: ', RGB_PAREN = 'rgb(', COLORS = {
                aliceblue: [240, 248, 255],
                antiquewhite: [250, 235, 215],
                aqua: [0, 255, 255],
                aquamarine: [127, 255, 212],
                azure: [240, 255, 255],
                beige: [245, 245, 220],
                bisque: [255, 228, 196],
                black: [0, 0, 0],
                blanchedalmond: [255, 235, 205],
                blue: [0, 0, 255],
                blueviolet: [138, 43, 226],
                brown: [165, 42, 42],
                burlywood: [222, 184, 135],
                cadetblue: [95, 158, 160],
                chartreuse: [127, 255, 0],
                chocolate: [210, 105, 30],
                coral: [255, 127, 80],
                cornflowerblue: [100, 149, 237],
                cornsilk: [255, 248, 220],
                crimson: [220, 20, 60],
                cyan: [0, 255, 255],
                darkblue: [0, 0, 139],
                darkcyan: [0, 139, 139],
                darkgoldenrod: [184, 132, 11],
                darkgray: [169, 169, 169],
                darkgreen: [0, 100, 0],
                darkgrey: [169, 169, 169],
                darkkhaki: [189, 183, 107],
                darkmagenta: [139, 0, 139],
                darkolivegreen: [85, 107, 47],
                darkorange: [255, 140, 0],
                darkorchid: [153, 50, 204],
                darkred: [139, 0, 0],
                darksalmon: [233, 150, 122],
                darkseagreen: [143, 188, 143],
                darkslateblue: [72, 61, 139],
                darkslategray: [47, 79, 79],
                darkslategrey: [47, 79, 79],
                darkturquoise: [0, 206, 209],
                darkviolet: [148, 0, 211],
                deeppink: [255, 20, 147],
                deepskyblue: [0, 191, 255],
                dimgray: [105, 105, 105],
                dimgrey: [105, 105, 105],
                dodgerblue: [30, 144, 255],
                firebrick: [178, 34, 34],
                floralwhite: [255, 255, 240],
                forestgreen: [34, 139, 34],
                fuchsia: [255, 0, 255],
                gainsboro: [220, 220, 220],
                ghostwhite: [248, 248, 255],
                gold: [255, 215, 0],
                goldenrod: [218, 165, 32],
                gray: [128, 128, 128],
                green: [0, 128, 0],
                greenyellow: [173, 255, 47],
                grey: [128, 128, 128],
                honeydew: [240, 255, 240],
                hotpink: [255, 105, 180],
                indianred: [205, 92, 92],
                indigo: [75, 0, 130],
                ivory: [255, 255, 240],
                khaki: [240, 230, 140],
                lavender: [230, 230, 250],
                lavenderblush: [255, 240, 245],
                lawngreen: [124, 252, 0],
                lemonchiffon: [255, 250, 205],
                lightblue: [173, 216, 230],
                lightcoral: [240, 128, 128],
                lightcyan: [224, 255, 255],
                lightgoldenrodyellow: [250, 250, 210],
                lightgray: [211, 211, 211],
                lightgreen: [144, 238, 144],
                lightgrey: [211, 211, 211],
                lightpink: [255, 182, 193],
                lightsalmon: [255, 160, 122],
                lightseagreen: [32, 178, 170],
                lightskyblue: [135, 206, 250],
                lightslategray: [119, 136, 153],
                lightslategrey: [119, 136, 153],
                lightsteelblue: [176, 196, 222],
                lightyellow: [255, 255, 224],
                lime: [0, 255, 0],
                limegreen: [50, 205, 50],
                linen: [250, 240, 230],
                magenta: [255, 0, 255],
                maroon: [128, 0, 0],
                mediumaquamarine: [102, 205, 170],
                mediumblue: [0, 0, 205],
                mediumorchid: [186, 85, 211],
                mediumpurple: [147, 112, 219],
                mediumseagreen: [60, 179, 113],
                mediumslateblue: [123, 104, 238],
                mediumspringgreen: [0, 250, 154],
                mediumturquoise: [72, 209, 204],
                mediumvioletred: [199, 21, 133],
                midnightblue: [25, 25, 112],
                mintcream: [245, 255, 250],
                mistyrose: [255, 228, 225],
                moccasin: [255, 228, 181],
                navajowhite: [255, 222, 173],
                navy: [0, 0, 128],
                oldlace: [253, 245, 230],
                olive: [128, 128, 0],
                olivedrab: [107, 142, 35],
                orange: [255, 165, 0],
                orangered: [255, 69, 0],
                orchid: [218, 112, 214],
                palegoldenrod: [238, 232, 170],
                palegreen: [152, 251, 152],
                paleturquoise: [175, 238, 238],
                palevioletred: [219, 112, 147],
                papayawhip: [255, 239, 213],
                peachpuff: [255, 218, 185],
                peru: [205, 133, 63],
                pink: [255, 192, 203],
                plum: [221, 160, 203],
                powderblue: [176, 224, 230],
                purple: [128, 0, 128],
                rebeccapurple: [102, 51, 153],
                red: [255, 0, 0],
                rosybrown: [188, 143, 143],
                royalblue: [65, 105, 225],
                saddlebrown: [139, 69, 19],
                salmon: [250, 128, 114],
                sandybrown: [244, 164, 96],
                seagreen: [46, 139, 87],
                seashell: [255, 245, 238],
                sienna: [160, 82, 45],
                silver: [192, 192, 192],
                skyblue: [135, 206, 235],
                slateblue: [106, 90, 205],
                slategray: [119, 128, 144],
                slategrey: [119, 128, 144],
                snow: [255, 255, 250],
                springgreen: [0, 255, 127],
                steelblue: [70, 130, 180],
                tan: [210, 180, 140],
                teal: [0, 128, 128],
                thistle: [216, 191, 216],
                transparent: [255, 255, 255, 0],
                tomato: [255, 99, 71],
                turquoise: [64, 224, 208],
                violet: [238, 130, 238],
                wheat: [245, 222, 179],
                white: [255, 255, 255],
                whitesmoke: [245, 245, 245],
                yellow: [255, 255, 0],
                yellowgreen: [154, 205, 5],
            }, RGB_REGEX = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/, animQueue = [];
            const req = (typeof requestAnimationFrame !== 'undefined' && requestAnimationFrame) ||
                function (f) {
                    setTimeout(f, 60);
                };
            const Util = {
                _isElement(obj) {
                    return !!(obj && obj.nodeType == 1);
                },
                _isFunction(obj) {
                    return !!(obj && obj.constructor && obj.call && obj.apply);
                },
                _isPlainObject(obj) {
                    return !!obj && obj.constructor === Object;
                },
                _isArray(obj) {
                    return Object.prototype.toString.call(obj) === OBJECT_ARRAY;
                },
                _isNumber(obj) {
                    return (Object.prototype.toString.call(obj) === OBJECT_NUMBER &&
                        !isNaN(obj) &&
                        isFinite(obj));
                },
                _isString(obj) {
                    return Object.prototype.toString.call(obj) === OBJECT_STRING;
                },
                _isBoolean(obj) {
                    return Object.prototype.toString.call(obj) === OBJECT_BOOLEAN;
                },
                isObject(val) {
                    return val instanceof Object;
                },
                isValidSelector(selector) {
                    if (typeof selector !== 'string') {
                        return false;
                    }
                    var firstChar = selector[0];
                    return (firstChar === '#' ||
                        firstChar === '.' ||
                        firstChar === firstChar.toUpperCase());
                },
                _sign(number) {
                    if (number === 0) {
                        return 1;
                    }
                    if (number > 0) {
                        return 1;
                    }
                    else {
                        return -1;
                    }
                },
                requestAnimFrame(callback) {
                    animQueue.push(callback);
                    if (animQueue.length === 1) {
                        req(function () {
                            const queue = animQueue;
                            animQueue = [];
                            queue.forEach(function (cb) {
                                cb();
                            });
                        });
                    }
                },
                createCanvasElement() {
                    var canvas = document.createElement('canvas');
                    try {
                        canvas.style = canvas.style || {};
                    }
                    catch (e) { }
                    return canvas;
                },
                createImageElement() {
                    return document.createElement('img');
                },
                _isInDocument(el) {
                    while ((el = el.parentNode)) {
                        if (el == document) {
                            return true;
                        }
                    }
                    return false;
                },
                _urlToImage(url, callback) {
                    var imageObj = Util.createImageElement();
                    imageObj.onload = function () {
                        callback(imageObj);
                    };
                    imageObj.src = url;
                },
                _rgbToHex(r, g, b) {
                    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                },
                _hexToRgb(hex) {
                    hex = hex.replace(HASH$1, EMPTY_STRING$1);
                    var bigint = parseInt(hex, 16);
                    return {
                        r: (bigint >> 16) & 255,
                        g: (bigint >> 8) & 255,
                        b: bigint & 255,
                    };
                },
                getRandomColor() {
                    var randColor = ((Math.random() * 0xffffff) << 0).toString(16);
                    while (randColor.length < 6) {
                        randColor = ZERO + randColor;
                    }
                    return HASH$1 + randColor;
                },
                getRGB(color) {
                    var rgb;
                    if (color in COLORS) {
                        rgb = COLORS[color];
                        return {
                            r: rgb[0],
                            g: rgb[1],
                            b: rgb[2],
                        };
                    }
                    else if (color[0] === HASH$1) {
                        return this._hexToRgb(color.substring(1));
                    }
                    else if (color.substr(0, 4) === RGB_PAREN) {
                        rgb = RGB_REGEX.exec(color.replace(/ /g, ''));
                        return {
                            r: parseInt(rgb[1], 10),
                            g: parseInt(rgb[2], 10),
                            b: parseInt(rgb[3], 10),
                        };
                    }
                    else {
                        return {
                            r: 0,
                            g: 0,
                            b: 0,
                        };
                    }
                },
                colorToRGBA(str) {
                    str = str || 'black';
                    return (Util._namedColorToRBA(str) ||
                        Util._hex3ColorToRGBA(str) ||
                        Util._hex4ColorToRGBA(str) ||
                        Util._hex6ColorToRGBA(str) ||
                        Util._hex8ColorToRGBA(str) ||
                        Util._rgbColorToRGBA(str) ||
                        Util._rgbaColorToRGBA(str) ||
                        Util._hslColorToRGBA(str));
                },
                _namedColorToRBA(str) {
                    var c = COLORS[str.toLowerCase()];
                    if (!c) {
                        return null;
                    }
                    return {
                        r: c[0],
                        g: c[1],
                        b: c[2],
                        a: 1,
                    };
                },
                _rgbColorToRGBA(str) {
                    if (str.indexOf('rgb(') === 0) {
                        str = str.match(/rgb\(([^)]+)\)/)[1];
                        var parts = str.split(/ *, */).map(Number);
                        return {
                            r: parts[0],
                            g: parts[1],
                            b: parts[2],
                            a: 1,
                        };
                    }
                },
                _rgbaColorToRGBA(str) {
                    if (str.indexOf('rgba(') === 0) {
                        str = str.match(/rgba\(([^)]+)\)/)[1];
                        var parts = str.split(/ *, */).map((n, index) => {
                            if (n.slice(-1) === '%') {
                                return index === 3 ? parseInt(n) / 100 : (parseInt(n) / 100) * 255;
                            }
                            return Number(n);
                        });
                        return {
                            r: parts[0],
                            g: parts[1],
                            b: parts[2],
                            a: parts[3],
                        };
                    }
                },
                _hex8ColorToRGBA(str) {
                    if (str[0] === '#' && str.length === 9) {
                        return {
                            r: parseInt(str.slice(1, 3), 16),
                            g: parseInt(str.slice(3, 5), 16),
                            b: parseInt(str.slice(5, 7), 16),
                            a: parseInt(str.slice(7, 9), 16) / 0xff,
                        };
                    }
                },
                _hex6ColorToRGBA(str) {
                    if (str[0] === '#' && str.length === 7) {
                        return {
                            r: parseInt(str.slice(1, 3), 16),
                            g: parseInt(str.slice(3, 5), 16),
                            b: parseInt(str.slice(5, 7), 16),
                            a: 1,
                        };
                    }
                },
                _hex4ColorToRGBA(str) {
                    if (str[0] === '#' && str.length === 5) {
                        return {
                            r: parseInt(str[1] + str[1], 16),
                            g: parseInt(str[2] + str[2], 16),
                            b: parseInt(str[3] + str[3], 16),
                            a: parseInt(str[4] + str[4], 16) / 0xff,
                        };
                    }
                },
                _hex3ColorToRGBA(str) {
                    if (str[0] === '#' && str.length === 4) {
                        return {
                            r: parseInt(str[1] + str[1], 16),
                            g: parseInt(str[2] + str[2], 16),
                            b: parseInt(str[3] + str[3], 16),
                            a: 1,
                        };
                    }
                },
                _hslColorToRGBA(str) {
                    if (/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.test(str)) {
                        const [_, ...hsl] = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(str);
                        const h = Number(hsl[0]) / 360;
                        const s = Number(hsl[1]) / 100;
                        const l = Number(hsl[2]) / 100;
                        let t2;
                        let t3;
                        let val;
                        if (s === 0) {
                            val = l * 255;
                            return {
                                r: Math.round(val),
                                g: Math.round(val),
                                b: Math.round(val),
                                a: 1,
                            };
                        }
                        if (l < 0.5) {
                            t2 = l * (1 + s);
                        }
                        else {
                            t2 = l + s - l * s;
                        }
                        const t1 = 2 * l - t2;
                        const rgb = [0, 0, 0];
                        for (let i = 0; i < 3; i++) {
                            t3 = h + (1 / 3) * -(i - 1);
                            if (t3 < 0) {
                                t3++;
                            }
                            if (t3 > 1) {
                                t3--;
                            }
                            if (6 * t3 < 1) {
                                val = t1 + (t2 - t1) * 6 * t3;
                            }
                            else if (2 * t3 < 1) {
                                val = t2;
                            }
                            else if (3 * t3 < 2) {
                                val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
                            }
                            else {
                                val = t1;
                            }
                            rgb[i] = val * 255;
                        }
                        return {
                            r: Math.round(rgb[0]),
                            g: Math.round(rgb[1]),
                            b: Math.round(rgb[2]),
                            a: 1,
                        };
                    }
                },
                haveIntersection(r1, r2) {
                    return !(r2.x > r1.x + r1.width ||
                        r2.x + r2.width < r1.x ||
                        r2.y > r1.y + r1.height ||
                        r2.y + r2.height < r1.y);
                },
                cloneObject(obj) {
                    var retObj = {};
                    for (var key in obj) {
                        if (this._isPlainObject(obj[key])) {
                            retObj[key] = this.cloneObject(obj[key]);
                        }
                        else if (this._isArray(obj[key])) {
                            retObj[key] = this.cloneArray(obj[key]);
                        }
                        else {
                            retObj[key] = obj[key];
                        }
                    }
                    return retObj;
                },
                cloneArray(arr) {
                    return arr.slice(0);
                },
                degToRad(deg) {
                    return deg * PI_OVER_DEG180;
                },
                radToDeg(rad) {
                    return rad * DEG180_OVER_PI;
                },
                _degToRad(deg) {
                    Util.warn('Util._degToRad is removed. Please use public Util.degToRad instead.');
                    return Util.degToRad(deg);
                },
                _radToDeg(rad) {
                    Util.warn('Util._radToDeg is removed. Please use public Util.radToDeg instead.');
                    return Util.radToDeg(rad);
                },
                _getRotation(radians) {
                    return Konva$2.angleDeg ? Util.radToDeg(radians) : radians;
                },
                _capitalize(str) {
                    return str.charAt(0).toUpperCase() + str.slice(1);
                },
                throw(str) {
                    throw new Error(KONVA_ERROR + str);
                },
                error(str) {
                    console.error(KONVA_ERROR + str);
                },
                warn(str) {
                    if (!Konva$2.showWarnings) {
                        return;
                    }
                    console.warn(KONVA_WARNING + str);
                },
                each(obj, func) {
                    for (var key in obj) {
                        func(key, obj[key]);
                    }
                },
                _inRange(val, left, right) {
                    return left <= val && val < right;
                },
                _getProjectionToSegment(x1, y1, x2, y2, x3, y3) {
                    var x, y, dist;
                    var pd2 = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
                    if (pd2 == 0) {
                        x = x1;
                        y = y1;
                        dist = (x3 - x2) * (x3 - x2) + (y3 - y2) * (y3 - y2);
                    }
                    else {
                        var u = ((x3 - x1) * (x2 - x1) + (y3 - y1) * (y2 - y1)) / pd2;
                        if (u < 0) {
                            x = x1;
                            y = y1;
                            dist = (x1 - x3) * (x1 - x3) + (y1 - y3) * (y1 - y3);
                        }
                        else if (u > 1.0) {
                            x = x2;
                            y = y2;
                            dist = (x2 - x3) * (x2 - x3) + (y2 - y3) * (y2 - y3);
                        }
                        else {
                            x = x1 + u * (x2 - x1);
                            y = y1 + u * (y2 - y1);
                            dist = (x - x3) * (x - x3) + (y - y3) * (y - y3);
                        }
                    }
                    return [x, y, dist];
                },
                _getProjectionToLine(pt, line, isClosed) {
                    var pc = Util.cloneObject(pt);
                    var dist = Number.MAX_VALUE;
                    line.forEach(function (p1, i) {
                        if (!isClosed && i === line.length - 1) {
                            return;
                        }
                        var p2 = line[(i + 1) % line.length];
                        var proj = Util._getProjectionToSegment(p1.x, p1.y, p2.x, p2.y, pt.x, pt.y);
                        var px = proj[0], py = proj[1], pdist = proj[2];
                        if (pdist < dist) {
                            pc.x = px;
                            pc.y = py;
                            dist = pdist;
                        }
                    });
                    return pc;
                },
                _prepareArrayForTween(startArray, endArray, isClosed) {
                    var n, start = [], end = [];
                    if (startArray.length > endArray.length) {
                        var temp = endArray;
                        endArray = startArray;
                        startArray = temp;
                    }
                    for (n = 0; n < startArray.length; n += 2) {
                        start.push({
                            x: startArray[n],
                            y: startArray[n + 1],
                        });
                    }
                    for (n = 0; n < endArray.length; n += 2) {
                        end.push({
                            x: endArray[n],
                            y: endArray[n + 1],
                        });
                    }
                    var newStart = [];
                    end.forEach(function (point) {
                        var pr = Util._getProjectionToLine(point, start, isClosed);
                        newStart.push(pr.x);
                        newStart.push(pr.y);
                    });
                    return newStart;
                },
                _prepareToStringify(obj) {
                    var desc;
                    obj.visitedByCircularReferenceRemoval = true;
                    for (var key in obj) {
                        if (!(obj.hasOwnProperty(key) && obj[key] && typeof obj[key] == 'object')) {
                            continue;
                        }
                        desc = Object.getOwnPropertyDescriptor(obj, key);
                        if (obj[key].visitedByCircularReferenceRemoval ||
                            Util._isElement(obj[key])) {
                            if (desc.configurable) {
                                delete obj[key];
                            }
                            else {
                                return null;
                            }
                        }
                        else if (Util._prepareToStringify(obj[key]) === null) {
                            if (desc.configurable) {
                                delete obj[key];
                            }
                            else {
                                return null;
                            }
                        }
                    }
                    delete obj.visitedByCircularReferenceRemoval;
                    return obj;
                },
                _assign(target, source) {
                    for (var key in source) {
                        target[key] = source[key];
                    }
                    return target;
                },
                _getFirstPointerId(evt) {
                    if (!evt.touches) {
                        return evt.pointerId || 999;
                    }
                    else {
                        return evt.changedTouches[0].identifier;
                    }
                },
                releaseCanvas(...canvases) {
                    if (!Konva$2.releaseCanvasOnDestroy)
                        return;
                    canvases.forEach(c => {
                        c.width = 0;
                        c.height = 0;
                    });
                },
                drawRoundedRectPath(context, width, height, cornerRadius) {
                    let topLeft = 0;
                    let topRight = 0;
                    let bottomLeft = 0;
                    let bottomRight = 0;
                    if (typeof cornerRadius === 'number') {
                        topLeft = topRight = bottomLeft = bottomRight = Math.min(cornerRadius, width / 2, height / 2);
                    }
                    else {
                        topLeft = Math.min(cornerRadius[0] || 0, width / 2, height / 2);
                        topRight = Math.min(cornerRadius[1] || 0, width / 2, height / 2);
                        bottomRight = Math.min(cornerRadius[2] || 0, width / 2, height / 2);
                        bottomLeft = Math.min(cornerRadius[3] || 0, width / 2, height / 2);
                    }
                    context.moveTo(topLeft, 0);
                    context.lineTo(width - topRight, 0);
                    context.arc(width - topRight, topRight, topRight, (Math.PI * 3) / 2, 0, false);
                    context.lineTo(width, height - bottomRight);
                    context.arc(width - bottomRight, height - bottomRight, bottomRight, 0, Math.PI / 2, false);
                    context.lineTo(bottomLeft, height);
                    context.arc(bottomLeft, height - bottomLeft, bottomLeft, Math.PI / 2, Math.PI, false);
                    context.lineTo(0, topLeft);
                    context.arc(topLeft, topLeft, topLeft, Math.PI, (Math.PI * 3) / 2, false);
                }
            };

            function _formatValue(val) {
                if (Util._isString(val)) {
                    return '"' + val + '"';
                }
                if (Object.prototype.toString.call(val) === '[object Number]') {
                    return val;
                }
                if (Util._isBoolean(val)) {
                    return val;
                }
                return Object.prototype.toString.call(val);
            }
            function RGBComponent(val) {
                if (val > 255) {
                    return 255;
                }
                else if (val < 0) {
                    return 0;
                }
                return Math.round(val);
            }
            function getNumberValidator() {
                if (Konva$2.isUnminified) {
                    return function (val, attr) {
                        if (!Util._isNumber(val)) {
                            Util.warn(_formatValue(val) +
                                ' is a not valid value for "' +
                                attr +
                                '" attribute. The value should be a number.');
                        }
                        return val;
                    };
                }
            }
            function getNumberOrArrayOfNumbersValidator(noOfElements) {
                if (Konva$2.isUnminified) {
                    return function (val, attr) {
                        let isNumber = Util._isNumber(val);
                        let isValidArray = Util._isArray(val) && val.length == noOfElements;
                        if (!isNumber && !isValidArray) {
                            Util.warn(_formatValue(val) +
                                ' is a not valid value for "' +
                                attr +
                                '" attribute. The value should be a number or Array<number>(' +
                                noOfElements +
                                ')');
                        }
                        return val;
                    };
                }
            }
            function getNumberOrAutoValidator() {
                if (Konva$2.isUnminified) {
                    return function (val, attr) {
                        var isNumber = Util._isNumber(val);
                        var isAuto = val === 'auto';
                        if (!(isNumber || isAuto)) {
                            Util.warn(_formatValue(val) +
                                ' is a not valid value for "' +
                                attr +
                                '" attribute. The value should be a number or "auto".');
                        }
                        return val;
                    };
                }
            }
            function getStringValidator() {
                if (Konva$2.isUnminified) {
                    return function (val, attr) {
                        if (!Util._isString(val)) {
                            Util.warn(_formatValue(val) +
                                ' is a not valid value for "' +
                                attr +
                                '" attribute. The value should be a string.');
                        }
                        return val;
                    };
                }
            }
            function getStringOrGradientValidator() {
                if (Konva$2.isUnminified) {
                    return function (val, attr) {
                        const isString = Util._isString(val);
                        const isGradient = Object.prototype.toString.call(val) === '[object CanvasGradient]' ||
                            (val && val.addColorStop);
                        if (!(isString || isGradient)) {
                            Util.warn(_formatValue(val) +
                                ' is a not valid value for "' +
                                attr +
                                '" attribute. The value should be a string or a native gradient.');
                        }
                        return val;
                    };
                }
            }
            function getNumberArrayValidator() {
                if (Konva$2.isUnminified) {
                    return function (val, attr) {
                        const TypedArray = Int8Array ? Object.getPrototypeOf(Int8Array) : null;
                        if (TypedArray && val instanceof TypedArray) {
                            return val;
                        }
                        if (!Util._isArray(val)) {
                            Util.warn(_formatValue(val) +
                                ' is a not valid value for "' +
                                attr +
                                '" attribute. The value should be a array of numbers.');
                        }
                        else {
                            val.forEach(function (item) {
                                if (!Util._isNumber(item)) {
                                    Util.warn('"' +
                                        attr +
                                        '" attribute has non numeric element ' +
                                        item +
                                        '. Make sure that all elements are numbers.');
                                }
                            });
                        }
                        return val;
                    };
                }
            }
            function getBooleanValidator() {
                if (Konva$2.isUnminified) {
                    return function (val, attr) {
                        var isBool = val === true || val === false;
                        if (!isBool) {
                            Util.warn(_formatValue(val) +
                                ' is a not valid value for "' +
                                attr +
                                '" attribute. The value should be a boolean.');
                        }
                        return val;
                    };
                }
            }
            function getComponentValidator(components) {
                if (Konva$2.isUnminified) {
                    return function (val, attr) {
                        if (val === undefined || val === null) {
                            return val;
                        }
                        if (!Util.isObject(val)) {
                            Util.warn(_formatValue(val) +
                                ' is a not valid value for "' +
                                attr +
                                '" attribute. The value should be an object with properties ' +
                                components);
                        }
                        return val;
                    };
                }
            }

            var GET = 'get', SET$1 = 'set';
            const Factory = {
                addGetterSetter(constructor, attr, def, validator, after) {
                    Factory.addGetter(constructor, attr, def);
                    Factory.addSetter(constructor, attr, validator, after);
                    Factory.addOverloadedGetterSetter(constructor, attr);
                },
                addGetter(constructor, attr, def) {
                    var method = GET + Util._capitalize(attr);
                    constructor.prototype[method] =
                        constructor.prototype[method] ||
                            function () {
                                var val = this.attrs[attr];
                                return val === undefined ? def : val;
                            };
                },
                addSetter(constructor, attr, validator, after) {
                    var method = SET$1 + Util._capitalize(attr);
                    if (!constructor.prototype[method]) {
                        Factory.overWriteSetter(constructor, attr, validator, after);
                    }
                },
                overWriteSetter(constructor, attr, validator, after) {
                    var method = SET$1 + Util._capitalize(attr);
                    constructor.prototype[method] = function (val) {
                        if (validator && val !== undefined && val !== null) {
                            val = validator.call(this, val, attr);
                        }
                        this._setAttr(attr, val);
                        if (after) {
                            after.call(this);
                        }
                        return this;
                    };
                },
                addComponentsGetterSetter(constructor, attr, components, validator, after) {
                    var len = components.length, capitalize = Util._capitalize, getter = GET + capitalize(attr), setter = SET$1 + capitalize(attr), n, component;
                    constructor.prototype[getter] = function () {
                        var ret = {};
                        for (n = 0; n < len; n++) {
                            component = components[n];
                            ret[component] = this.getAttr(attr + capitalize(component));
                        }
                        return ret;
                    };
                    var basicValidator = getComponentValidator(components);
                    constructor.prototype[setter] = function (val) {
                        var oldVal = this.attrs[attr], key;
                        if (validator) {
                            val = validator.call(this, val);
                        }
                        if (basicValidator) {
                            basicValidator.call(this, val, attr);
                        }
                        for (key in val) {
                            if (!val.hasOwnProperty(key)) {
                                continue;
                            }
                            this._setAttr(attr + capitalize(key), val[key]);
                        }
                        if (!val) {
                            components.forEach((component) => {
                                this._setAttr(attr + capitalize(component), undefined);
                            });
                        }
                        this._fireChangeEvent(attr, oldVal, val);
                        if (after) {
                            after.call(this);
                        }
                        return this;
                    };
                    Factory.addOverloadedGetterSetter(constructor, attr);
                },
                addOverloadedGetterSetter(constructor, attr) {
                    var capitalizedAttr = Util._capitalize(attr), setter = SET$1 + capitalizedAttr, getter = GET + capitalizedAttr;
                    constructor.prototype[attr] = function () {
                        if (arguments.length) {
                            this[setter](arguments[0]);
                            return this;
                        }
                        return this[getter]();
                    };
                },
                addDeprecatedGetterSetter(constructor, attr, def, validator) {
                    Util.error('Adding deprecated ' + attr);
                    var method = GET + Util._capitalize(attr);
                    var message = attr +
                        ' property is deprecated and will be removed soon. Look at Konva change log for more information.';
                    constructor.prototype[method] = function () {
                        Util.error(message);
                        var val = this.attrs[attr];
                        return val === undefined ? def : val;
                    };
                    Factory.addSetter(constructor, attr, validator, function () {
                        Util.error(message);
                    });
                    Factory.addOverloadedGetterSetter(constructor, attr);
                },
                backCompat(constructor, methods) {
                    Util.each(methods, function (oldMethodName, newMethodName) {
                        var method = constructor.prototype[newMethodName];
                        var oldGetter = GET + Util._capitalize(oldMethodName);
                        var oldSetter = SET$1 + Util._capitalize(oldMethodName);
                        function deprecated() {
                            method.apply(this, arguments);
                            Util.error('"' +
                                oldMethodName +
                                '" method is deprecated and will be removed soon. Use ""' +
                                newMethodName +
                                '" instead.');
                        }
                        constructor.prototype[oldMethodName] = deprecated;
                        constructor.prototype[oldGetter] = deprecated;
                        constructor.prototype[oldSetter] = deprecated;
                    });
                },
                afterSetFilter() {
                    this._filterUpToDate = false;
                },
            };

            function simplifyArray(arr) {
                var retArr = [], len = arr.length, util = Util, n, val;
                for (n = 0; n < len; n++) {
                    val = arr[n];
                    if (util._isNumber(val)) {
                        val = Math.round(val * 1000) / 1000;
                    }
                    else if (!util._isString(val)) {
                        val = val + '';
                    }
                    retArr.push(val);
                }
                return retArr;
            }
            var COMMA = ',', OPEN_PAREN = '(', CLOSE_PAREN = ')', OPEN_PAREN_BRACKET = '([', CLOSE_BRACKET_PAREN = '])', SEMICOLON = ';', DOUBLE_PAREN = '()', EQUALS = '=', CONTEXT_METHODS = [
                'arc',
                'arcTo',
                'beginPath',
                'bezierCurveTo',
                'clearRect',
                'clip',
                'closePath',
                'createLinearGradient',
                'createPattern',
                'createRadialGradient',
                'drawImage',
                'ellipse',
                'fill',
                'fillText',
                'getImageData',
                'createImageData',
                'lineTo',
                'moveTo',
                'putImageData',
                'quadraticCurveTo',
                'rect',
                'restore',
                'rotate',
                'save',
                'scale',
                'setLineDash',
                'setTransform',
                'stroke',
                'strokeText',
                'transform',
                'translate',
            ];
            var CONTEXT_PROPERTIES = [
                'fillStyle',
                'strokeStyle',
                'shadowColor',
                'shadowBlur',
                'shadowOffsetX',
                'shadowOffsetY',
                'lineCap',
                'lineDashOffset',
                'lineJoin',
                'lineWidth',
                'miterLimit',
                'font',
                'textAlign',
                'textBaseline',
                'globalAlpha',
                'globalCompositeOperation',
                'imageSmoothingEnabled',
            ];
            const traceArrMax = 100;
            class Context$1 {
                constructor(canvas) {
                    this.canvas = canvas;
                    if (Konva$2.enableTrace) {
                        this.traceArr = [];
                        this._enableTrace();
                    }
                }
                fillShape(shape) {
                    if (shape.fillEnabled()) {
                        this._fill(shape);
                    }
                }
                _fill(shape) {
                }
                strokeShape(shape) {
                    if (shape.hasStroke()) {
                        this._stroke(shape);
                    }
                }
                _stroke(shape) {
                }
                fillStrokeShape(shape) {
                    if (shape.attrs.fillAfterStrokeEnabled) {
                        this.strokeShape(shape);
                        this.fillShape(shape);
                    }
                    else {
                        this.fillShape(shape);
                        this.strokeShape(shape);
                    }
                }
                getTrace(relaxed, rounded) {
                    var traceArr = this.traceArr, len = traceArr.length, str = '', n, trace, method, args;
                    for (n = 0; n < len; n++) {
                        trace = traceArr[n];
                        method = trace.method;
                        if (method) {
                            args = trace.args;
                            str += method;
                            if (relaxed) {
                                str += DOUBLE_PAREN;
                            }
                            else {
                                if (Util._isArray(args[0])) {
                                    str += OPEN_PAREN_BRACKET + args.join(COMMA) + CLOSE_BRACKET_PAREN;
                                }
                                else {
                                    if (rounded) {
                                        args = args.map((a) => typeof a === 'number' ? Math.floor(a) : a);
                                    }
                                    str += OPEN_PAREN + args.join(COMMA) + CLOSE_PAREN;
                                }
                            }
                        }
                        else {
                            str += trace.property;
                            if (!relaxed) {
                                str += EQUALS + trace.val;
                            }
                        }
                        str += SEMICOLON;
                    }
                    return str;
                }
                clearTrace() {
                    this.traceArr = [];
                }
                _trace(str) {
                    var traceArr = this.traceArr, len;
                    traceArr.push(str);
                    len = traceArr.length;
                    if (len >= traceArrMax) {
                        traceArr.shift();
                    }
                }
                reset() {
                    var pixelRatio = this.getCanvas().getPixelRatio();
                    this.setTransform(1 * pixelRatio, 0, 0, 1 * pixelRatio, 0, 0);
                }
                getCanvas() {
                    return this.canvas;
                }
                clear(bounds) {
                    var canvas = this.getCanvas();
                    if (bounds) {
                        this.clearRect(bounds.x || 0, bounds.y || 0, bounds.width || 0, bounds.height || 0);
                    }
                    else {
                        this.clearRect(0, 0, canvas.getWidth() / canvas.pixelRatio, canvas.getHeight() / canvas.pixelRatio);
                    }
                }
                _applyLineCap(shape) {
                    const lineCap = shape.attrs.lineCap;
                    if (lineCap) {
                        this.setAttr('lineCap', lineCap);
                    }
                }
                _applyOpacity(shape) {
                    var absOpacity = shape.getAbsoluteOpacity();
                    if (absOpacity !== 1) {
                        this.setAttr('globalAlpha', absOpacity);
                    }
                }
                _applyLineJoin(shape) {
                    const lineJoin = shape.attrs.lineJoin;
                    if (lineJoin) {
                        this.setAttr('lineJoin', lineJoin);
                    }
                }
                setAttr(attr, val) {
                    this._context[attr] = val;
                }
                arc(a0, a1, a2, a3, a4, a5) {
                    this._context.arc(a0, a1, a2, a3, a4, a5);
                }
                arcTo(a0, a1, a2, a3, a4) {
                    this._context.arcTo(a0, a1, a2, a3, a4);
                }
                beginPath() {
                    this._context.beginPath();
                }
                bezierCurveTo(a0, a1, a2, a3, a4, a5) {
                    this._context.bezierCurveTo(a0, a1, a2, a3, a4, a5);
                }
                clearRect(a0, a1, a2, a3) {
                    this._context.clearRect(a0, a1, a2, a3);
                }
                clip() {
                    this._context.clip();
                }
                closePath() {
                    this._context.closePath();
                }
                createImageData(a0, a1) {
                    var a = arguments;
                    if (a.length === 2) {
                        return this._context.createImageData(a0, a1);
                    }
                    else if (a.length === 1) {
                        return this._context.createImageData(a0);
                    }
                }
                createLinearGradient(a0, a1, a2, a3) {
                    return this._context.createLinearGradient(a0, a1, a2, a3);
                }
                createPattern(a0, a1) {
                    return this._context.createPattern(a0, a1);
                }
                createRadialGradient(a0, a1, a2, a3, a4, a5) {
                    return this._context.createRadialGradient(a0, a1, a2, a3, a4, a5);
                }
                drawImage(a0, a1, a2, a3, a4, a5, a6, a7, a8) {
                    var a = arguments, _context = this._context;
                    if (a.length === 3) {
                        _context.drawImage(a0, a1, a2);
                    }
                    else if (a.length === 5) {
                        _context.drawImage(a0, a1, a2, a3, a4);
                    }
                    else if (a.length === 9) {
                        _context.drawImage(a0, a1, a2, a3, a4, a5, a6, a7, a8);
                    }
                }
                ellipse(a0, a1, a2, a3, a4, a5, a6, a7) {
                    this._context.ellipse(a0, a1, a2, a3, a4, a5, a6, a7);
                }
                isPointInPath(x, y, path, fillRule) {
                    if (path) {
                        return this._context.isPointInPath(path, x, y, fillRule);
                    }
                    return this._context.isPointInPath(x, y, fillRule);
                }
                fill(path2d) {
                    if (path2d) {
                        this._context.fill(path2d);
                    }
                    else {
                        this._context.fill();
                    }
                }
                fillRect(x, y, width, height) {
                    this._context.fillRect(x, y, width, height);
                }
                strokeRect(x, y, width, height) {
                    this._context.strokeRect(x, y, width, height);
                }
                fillText(text, x, y, maxWidth) {
                    if (maxWidth) {
                        this._context.fillText(text, x, y, maxWidth);
                    }
                    else {
                        this._context.fillText(text, x, y);
                    }
                }
                measureText(text) {
                    return this._context.measureText(text);
                }
                getImageData(a0, a1, a2, a3) {
                    return this._context.getImageData(a0, a1, a2, a3);
                }
                lineTo(a0, a1) {
                    this._context.lineTo(a0, a1);
                }
                moveTo(a0, a1) {
                    this._context.moveTo(a0, a1);
                }
                rect(a0, a1, a2, a3) {
                    this._context.rect(a0, a1, a2, a3);
                }
                putImageData(a0, a1, a2) {
                    this._context.putImageData(a0, a1, a2);
                }
                quadraticCurveTo(a0, a1, a2, a3) {
                    this._context.quadraticCurveTo(a0, a1, a2, a3);
                }
                restore() {
                    this._context.restore();
                }
                rotate(a0) {
                    this._context.rotate(a0);
                }
                save() {
                    this._context.save();
                }
                scale(a0, a1) {
                    this._context.scale(a0, a1);
                }
                setLineDash(a0) {
                    if (this._context.setLineDash) {
                        this._context.setLineDash(a0);
                    }
                    else if ('mozDash' in this._context) {
                        this._context['mozDash'] = a0;
                    }
                    else if ('webkitLineDash' in this._context) {
                        this._context['webkitLineDash'] = a0;
                    }
                }
                getLineDash() {
                    return this._context.getLineDash();
                }
                setTransform(a0, a1, a2, a3, a4, a5) {
                    this._context.setTransform(a0, a1, a2, a3, a4, a5);
                }
                stroke(path2d) {
                    if (path2d) {
                        this._context.stroke(path2d);
                    }
                    else {
                        this._context.stroke();
                    }
                }
                strokeText(a0, a1, a2, a3) {
                    this._context.strokeText(a0, a1, a2, a3);
                }
                transform(a0, a1, a2, a3, a4, a5) {
                    this._context.transform(a0, a1, a2, a3, a4, a5);
                }
                translate(a0, a1) {
                    this._context.translate(a0, a1);
                }
                _enableTrace() {
                    var that = this, len = CONTEXT_METHODS.length, origSetter = this.setAttr, n, args;
                    var func = function (methodName) {
                        var origMethod = that[methodName], ret;
                        that[methodName] = function () {
                            args = simplifyArray(Array.prototype.slice.call(arguments, 0));
                            ret = origMethod.apply(that, arguments);
                            that._trace({
                                method: methodName,
                                args: args,
                            });
                            return ret;
                        };
                    };
                    for (n = 0; n < len; n++) {
                        func(CONTEXT_METHODS[n]);
                    }
                    that.setAttr = function () {
                        origSetter.apply(that, arguments);
                        var prop = arguments[0];
                        var val = arguments[1];
                        if (prop === 'shadowOffsetX' ||
                            prop === 'shadowOffsetY' ||
                            prop === 'shadowBlur') {
                            val = val / this.canvas.getPixelRatio();
                        }
                        that._trace({
                            property: prop,
                            val: val,
                        });
                    };
                }
                _applyGlobalCompositeOperation(node) {
                    const op = node.attrs.globalCompositeOperation;
                    var def = !op || op === 'source-over';
                    if (!def) {
                        this.setAttr('globalCompositeOperation', op);
                    }
                }
            }
            CONTEXT_PROPERTIES.forEach(function (prop) {
                Object.defineProperty(Context$1.prototype, prop, {
                    get() {
                        return this._context[prop];
                    },
                    set(val) {
                        this._context[prop] = val;
                    },
                });
            });
            class SceneContext extends Context$1 {
                constructor(canvas) {
                    super(canvas);
                    this._context = canvas._canvas.getContext('2d');
                }
                _fillColor(shape) {
                    var fill = shape.fill();
                    this.setAttr('fillStyle', fill);
                    shape._fillFunc(this);
                }
                _fillPattern(shape) {
                    this.setAttr('fillStyle', shape._getFillPattern());
                    shape._fillFunc(this);
                }
                _fillLinearGradient(shape) {
                    var grd = shape._getLinearGradient();
                    if (grd) {
                        this.setAttr('fillStyle', grd);
                        shape._fillFunc(this);
                    }
                }
                _fillRadialGradient(shape) {
                    const grd = shape._getRadialGradient();
                    if (grd) {
                        this.setAttr('fillStyle', grd);
                        shape._fillFunc(this);
                    }
                }
                _fill(shape) {
                    const hasColor = shape.fill(), fillPriority = shape.getFillPriority();
                    if (hasColor && fillPriority === 'color') {
                        this._fillColor(shape);
                        return;
                    }
                    const hasPattern = shape.getFillPatternImage();
                    if (hasPattern && fillPriority === 'pattern') {
                        this._fillPattern(shape);
                        return;
                    }
                    const hasLinearGradient = shape.getFillLinearGradientColorStops();
                    if (hasLinearGradient && fillPriority === 'linear-gradient') {
                        this._fillLinearGradient(shape);
                        return;
                    }
                    const hasRadialGradient = shape.getFillRadialGradientColorStops();
                    if (hasRadialGradient && fillPriority === 'radial-gradient') {
                        this._fillRadialGradient(shape);
                        return;
                    }
                    if (hasColor) {
                        this._fillColor(shape);
                    }
                    else if (hasPattern) {
                        this._fillPattern(shape);
                    }
                    else if (hasLinearGradient) {
                        this._fillLinearGradient(shape);
                    }
                    else if (hasRadialGradient) {
                        this._fillRadialGradient(shape);
                    }
                }
                _strokeLinearGradient(shape) {
                    const start = shape.getStrokeLinearGradientStartPoint(), end = shape.getStrokeLinearGradientEndPoint(), colorStops = shape.getStrokeLinearGradientColorStops(), grd = this.createLinearGradient(start.x, start.y, end.x, end.y);
                    if (colorStops) {
                        for (var n = 0; n < colorStops.length; n += 2) {
                            grd.addColorStop(colorStops[n], colorStops[n + 1]);
                        }
                        this.setAttr('strokeStyle', grd);
                    }
                }
                _stroke(shape) {
                    var dash = shape.dash(), strokeScaleEnabled = shape.getStrokeScaleEnabled();
                    if (shape.hasStroke()) {
                        if (!strokeScaleEnabled) {
                            this.save();
                            var pixelRatio = this.getCanvas().getPixelRatio();
                            this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                        }
                        this._applyLineCap(shape);
                        if (dash && shape.dashEnabled()) {
                            this.setLineDash(dash);
                            this.setAttr('lineDashOffset', shape.dashOffset());
                        }
                        this.setAttr('lineWidth', shape.strokeWidth());
                        if (!shape.getShadowForStrokeEnabled()) {
                            this.setAttr('shadowColor', 'rgba(0,0,0,0)');
                        }
                        var hasLinearGradient = shape.getStrokeLinearGradientColorStops();
                        if (hasLinearGradient) {
                            this._strokeLinearGradient(shape);
                        }
                        else {
                            this.setAttr('strokeStyle', shape.stroke());
                        }
                        shape._strokeFunc(this);
                        if (!strokeScaleEnabled) {
                            this.restore();
                        }
                    }
                }
                _applyShadow(shape) {
                    var _a, _b, _c;
                    var color = (_a = shape.getShadowRGBA()) !== null && _a !== void 0 ? _a : 'black', blur = (_b = shape.getShadowBlur()) !== null && _b !== void 0 ? _b : 5, offset = (_c = shape.getShadowOffset()) !== null && _c !== void 0 ? _c : {
                        x: 0,
                        y: 0,
                    }, scale = shape.getAbsoluteScale(), ratio = this.canvas.getPixelRatio(), scaleX = scale.x * ratio, scaleY = scale.y * ratio;
                    this.setAttr('shadowColor', color);
                    this.setAttr('shadowBlur', blur * Math.min(Math.abs(scaleX), Math.abs(scaleY)));
                    this.setAttr('shadowOffsetX', offset.x * scaleX);
                    this.setAttr('shadowOffsetY', offset.y * scaleY);
                }
            }
            class HitContext extends Context$1 {
                constructor(canvas) {
                    super(canvas);
                    this._context = canvas._canvas.getContext('2d', {
                        willReadFrequently: true,
                    });
                }
                _fill(shape) {
                    this.save();
                    this.setAttr('fillStyle', shape.colorKey);
                    shape._fillFuncHit(this);
                    this.restore();
                }
                strokeShape(shape) {
                    if (shape.hasHitStroke()) {
                        this._stroke(shape);
                    }
                }
                _stroke(shape) {
                    if (shape.hasHitStroke()) {
                        const strokeScaleEnabled = shape.getStrokeScaleEnabled();
                        if (!strokeScaleEnabled) {
                            this.save();
                            var pixelRatio = this.getCanvas().getPixelRatio();
                            this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                        }
                        this._applyLineCap(shape);
                        var hitStrokeWidth = shape.hitStrokeWidth();
                        var strokeWidth = hitStrokeWidth === 'auto' ? shape.strokeWidth() : hitStrokeWidth;
                        this.setAttr('lineWidth', strokeWidth);
                        this.setAttr('strokeStyle', shape.colorKey);
                        shape._strokeFuncHit(this);
                        if (!strokeScaleEnabled) {
                            this.restore();
                        }
                    }
                }
            }

            var _pixelRatio;
            function getDevicePixelRatio() {
                if (_pixelRatio) {
                    return _pixelRatio;
                }
                var canvas = Util.createCanvasElement();
                var context = canvas.getContext('2d');
                _pixelRatio = (function () {
                    var devicePixelRatio = Konva$2._global.devicePixelRatio || 1, backingStoreRatio = context.webkitBackingStorePixelRatio ||
                        context.mozBackingStorePixelRatio ||
                        context.msBackingStorePixelRatio ||
                        context.oBackingStorePixelRatio ||
                        context.backingStorePixelRatio ||
                        1;
                    return devicePixelRatio / backingStoreRatio;
                })();
                Util.releaseCanvas(canvas);
                return _pixelRatio;
            }
            class Canvas {
                constructor(config) {
                    this.pixelRatio = 1;
                    this.width = 0;
                    this.height = 0;
                    this.isCache = false;
                    var conf = config || {};
                    var pixelRatio = conf.pixelRatio || Konva$2.pixelRatio || getDevicePixelRatio();
                    this.pixelRatio = pixelRatio;
                    this._canvas = Util.createCanvasElement();
                    this._canvas.style.padding = '0';
                    this._canvas.style.margin = '0';
                    this._canvas.style.border = '0';
                    this._canvas.style.background = 'transparent';
                    this._canvas.style.position = 'absolute';
                    this._canvas.style.top = '0';
                    this._canvas.style.left = '0';
                }
                getContext() {
                    return this.context;
                }
                getPixelRatio() {
                    return this.pixelRatio;
                }
                setPixelRatio(pixelRatio) {
                    var previousRatio = this.pixelRatio;
                    this.pixelRatio = pixelRatio;
                    this.setSize(this.getWidth() / previousRatio, this.getHeight() / previousRatio);
                }
                setWidth(width) {
                    this.width = this._canvas.width = width * this.pixelRatio;
                    this._canvas.style.width = width + 'px';
                    var pixelRatio = this.pixelRatio, _context = this.getContext()._context;
                    _context.scale(pixelRatio, pixelRatio);
                }
                setHeight(height) {
                    this.height = this._canvas.height = height * this.pixelRatio;
                    this._canvas.style.height = height + 'px';
                    var pixelRatio = this.pixelRatio, _context = this.getContext()._context;
                    _context.scale(pixelRatio, pixelRatio);
                }
                getWidth() {
                    return this.width;
                }
                getHeight() {
                    return this.height;
                }
                setSize(width, height) {
                    this.setWidth(width || 0);
                    this.setHeight(height || 0);
                }
                toDataURL(mimeType, quality) {
                    try {
                        return this._canvas.toDataURL(mimeType, quality);
                    }
                    catch (e) {
                        try {
                            return this._canvas.toDataURL();
                        }
                        catch (err) {
                            Util.error('Unable to get data URL. ' +
                                err.message +
                                ' For more info read https://konvajs.org/docs/posts/Tainted_Canvas.html.');
                            return '';
                        }
                    }
                }
            }
            Factory.addGetterSetter(Canvas, 'pixelRatio', undefined, getNumberValidator());
            class SceneCanvas extends Canvas {
                constructor(config = { width: 0, height: 0 }) {
                    super(config);
                    this.context = new SceneContext(this);
                    this.setSize(config.width, config.height);
                }
            }
            class HitCanvas extends Canvas {
                constructor(config = { width: 0, height: 0 }) {
                    super(config);
                    this.hitCanvas = true;
                    this.context = new HitContext(this);
                    this.setSize(config.width, config.height);
                }
            }

            const DD = {
                get isDragging() {
                    var flag = false;
                    DD._dragElements.forEach((elem) => {
                        if (elem.dragStatus === 'dragging') {
                            flag = true;
                        }
                    });
                    return flag;
                },
                justDragged: false,
                get node() {
                    var node;
                    DD._dragElements.forEach((elem) => {
                        node = elem.node;
                    });
                    return node;
                },
                _dragElements: new Map(),
                _drag(evt) {
                    const nodesToFireEvents = [];
                    DD._dragElements.forEach((elem, key) => {
                        const { node } = elem;
                        const stage = node.getStage();
                        stage.setPointersPositions(evt);
                        if (elem.pointerId === undefined) {
                            elem.pointerId = Util._getFirstPointerId(evt);
                        }
                        const pos = stage._changedPointerPositions.find((pos) => pos.id === elem.pointerId);
                        if (!pos) {
                            return;
                        }
                        if (elem.dragStatus !== 'dragging') {
                            var dragDistance = node.dragDistance();
                            var distance = Math.max(Math.abs(pos.x - elem.startPointerPos.x), Math.abs(pos.y - elem.startPointerPos.y));
                            if (distance < dragDistance) {
                                return;
                            }
                            node.startDrag({ evt });
                            if (!node.isDragging()) {
                                return;
                            }
                        }
                        node._setDragPosition(evt, elem);
                        nodesToFireEvents.push(node);
                    });
                    nodesToFireEvents.forEach((node) => {
                        node.fire('dragmove', {
                            type: 'dragmove',
                            target: node,
                            evt: evt,
                        }, true);
                    });
                },
                _endDragBefore(evt) {
                    const drawNodes = [];
                    DD._dragElements.forEach((elem) => {
                        const { node } = elem;
                        const stage = node.getStage();
                        if (evt) {
                            stage.setPointersPositions(evt);
                        }
                        const pos = stage._changedPointerPositions.find((pos) => pos.id === elem.pointerId);
                        if (!pos) {
                            return;
                        }
                        if (elem.dragStatus === 'dragging' || elem.dragStatus === 'stopped') {
                            DD.justDragged = true;
                            Konva$2._mouseListenClick = false;
                            Konva$2._touchListenClick = false;
                            Konva$2._pointerListenClick = false;
                            elem.dragStatus = 'stopped';
                        }
                        const drawNode = elem.node.getLayer() ||
                            (elem.node instanceof Konva$2['Stage'] && elem.node);
                        if (drawNode && drawNodes.indexOf(drawNode) === -1) {
                            drawNodes.push(drawNode);
                        }
                    });
                    drawNodes.forEach((drawNode) => {
                        drawNode.draw();
                    });
                },
                _endDragAfter(evt) {
                    DD._dragElements.forEach((elem, key) => {
                        if (elem.dragStatus === 'stopped') {
                            elem.node.fire('dragend', {
                                type: 'dragend',
                                target: elem.node,
                                evt: evt,
                            }, true);
                        }
                        if (elem.dragStatus !== 'dragging') {
                            DD._dragElements.delete(key);
                        }
                    });
                },
            };
            if (Konva$2.isBrowser) {
                window.addEventListener('mouseup', DD._endDragBefore, true);
                window.addEventListener('touchend', DD._endDragBefore, true);
                window.addEventListener('mousemove', DD._drag);
                window.addEventListener('touchmove', DD._drag);
                window.addEventListener('mouseup', DD._endDragAfter, false);
                window.addEventListener('touchend', DD._endDragAfter, false);
            }

            var ABSOLUTE_OPACITY = 'absoluteOpacity', ALL_LISTENERS = 'allEventListeners', ABSOLUTE_TRANSFORM = 'absoluteTransform', ABSOLUTE_SCALE = 'absoluteScale', CANVAS = 'canvas', CHANGE = 'Change', CHILDREN = 'children', KONVA = 'konva', LISTENING = 'listening', MOUSEENTER$1 = 'mouseenter', MOUSELEAVE$1 = 'mouseleave', SET = 'set', SHAPE = 'Shape', SPACE$1 = ' ', STAGE$1 = 'stage', TRANSFORM = 'transform', UPPER_STAGE = 'Stage', VISIBLE = 'visible', TRANSFORM_CHANGE_STR$1 = [
                'xChange.konva',
                'yChange.konva',
                'scaleXChange.konva',
                'scaleYChange.konva',
                'skewXChange.konva',
                'skewYChange.konva',
                'rotationChange.konva',
                'offsetXChange.konva',
                'offsetYChange.konva',
                'transformsEnabledChange.konva',
            ].join(SPACE$1);
            let idCounter$1 = 1;
            class Node {
                constructor(config) {
                    this._id = idCounter$1++;
                    this.eventListeners = {};
                    this.attrs = {};
                    this.index = 0;
                    this._allEventListeners = null;
                    this.parent = null;
                    this._cache = new Map();
                    this._attachedDepsListeners = new Map();
                    this._lastPos = null;
                    this._batchingTransformChange = false;
                    this._needClearTransformCache = false;
                    this._filterUpToDate = false;
                    this._isUnderCache = false;
                    this._dragEventId = null;
                    this._shouldFireChangeEvents = false;
                    this.setAttrs(config);
                    this._shouldFireChangeEvents = true;
                }
                hasChildren() {
                    return false;
                }
                _clearCache(attr) {
                    if ((attr === TRANSFORM || attr === ABSOLUTE_TRANSFORM) &&
                        this._cache.get(attr)) {
                        this._cache.get(attr).dirty = true;
                    }
                    else if (attr) {
                        this._cache.delete(attr);
                    }
                    else {
                        this._cache.clear();
                    }
                }
                _getCache(attr, privateGetter) {
                    var cache = this._cache.get(attr);
                    var isTransform = attr === TRANSFORM || attr === ABSOLUTE_TRANSFORM;
                    var invalid = cache === undefined || (isTransform && cache.dirty === true);
                    if (invalid) {
                        cache = privateGetter.call(this);
                        this._cache.set(attr, cache);
                    }
                    return cache;
                }
                _calculate(name, deps, getter) {
                    if (!this._attachedDepsListeners.get(name)) {
                        const depsString = deps.map((dep) => dep + 'Change.konva').join(SPACE$1);
                        this.on(depsString, () => {
                            this._clearCache(name);
                        });
                        this._attachedDepsListeners.set(name, true);
                    }
                    return this._getCache(name, getter);
                }
                _getCanvasCache() {
                    return this._cache.get(CANVAS);
                }
                _clearSelfAndDescendantCache(attr) {
                    this._clearCache(attr);
                    if (attr === ABSOLUTE_TRANSFORM) {
                        this.fire('absoluteTransformChange');
                    }
                }
                clearCache() {
                    if (this._cache.has(CANVAS)) {
                        const { scene, filter, hit } = this._cache.get(CANVAS);
                        Util.releaseCanvas(scene, filter, hit);
                        this._cache.delete(CANVAS);
                    }
                    this._clearSelfAndDescendantCache();
                    this._requestDraw();
                    return this;
                }
                cache(config) {
                    var conf = config || {};
                    var rect = {};
                    if (conf.x === undefined ||
                        conf.y === undefined ||
                        conf.width === undefined ||
                        conf.height === undefined) {
                        rect = this.getClientRect({
                            skipTransform: true,
                            relativeTo: this.getParent(),
                        });
                    }
                    var width = Math.ceil(conf.width || rect.width), height = Math.ceil(conf.height || rect.height), pixelRatio = conf.pixelRatio, x = conf.x === undefined ? Math.floor(rect.x) : conf.x, y = conf.y === undefined ? Math.floor(rect.y) : conf.y, offset = conf.offset || 0, drawBorder = conf.drawBorder || false, hitCanvasPixelRatio = conf.hitCanvasPixelRatio || 1;
                    if (!width || !height) {
                        Util.error('Can not cache the node. Width or height of the node equals 0. Caching is skipped.');
                        return;
                    }
                    width += offset * 2 + 1;
                    height += offset * 2 + 1;
                    x -= offset;
                    y -= offset;
                    var cachedSceneCanvas = new SceneCanvas({
                        pixelRatio: pixelRatio,
                        width: width,
                        height: height,
                    }), cachedFilterCanvas = new SceneCanvas({
                        pixelRatio: pixelRatio,
                        width: 0,
                        height: 0,
                    }), cachedHitCanvas = new HitCanvas({
                        pixelRatio: hitCanvasPixelRatio,
                        width: width,
                        height: height,
                    }), sceneContext = cachedSceneCanvas.getContext(), hitContext = cachedHitCanvas.getContext();
                    cachedHitCanvas.isCache = true;
                    cachedSceneCanvas.isCache = true;
                    this._cache.delete(CANVAS);
                    this._filterUpToDate = false;
                    if (conf.imageSmoothingEnabled === false) {
                        cachedSceneCanvas.getContext()._context.imageSmoothingEnabled = false;
                        cachedFilterCanvas.getContext()._context.imageSmoothingEnabled = false;
                    }
                    sceneContext.save();
                    hitContext.save();
                    sceneContext.translate(-x, -y);
                    hitContext.translate(-x, -y);
                    this._isUnderCache = true;
                    this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
                    this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);
                    this.drawScene(cachedSceneCanvas, this);
                    this.drawHit(cachedHitCanvas, this);
                    this._isUnderCache = false;
                    sceneContext.restore();
                    hitContext.restore();
                    if (drawBorder) {
                        sceneContext.save();
                        sceneContext.beginPath();
                        sceneContext.rect(0, 0, width, height);
                        sceneContext.closePath();
                        sceneContext.setAttr('strokeStyle', 'red');
                        sceneContext.setAttr('lineWidth', 5);
                        sceneContext.stroke();
                        sceneContext.restore();
                    }
                    this._cache.set(CANVAS, {
                        scene: cachedSceneCanvas,
                        filter: cachedFilterCanvas,
                        hit: cachedHitCanvas,
                        x: x,
                        y: y,
                    });
                    this._requestDraw();
                    return this;
                }
                isCached() {
                    return this._cache.has(CANVAS);
                }
                getClientRect(config) {
                    throw new Error('abstract "getClientRect" method call');
                }
                _transformedRect(rect, top) {
                    var points = [
                        { x: rect.x, y: rect.y },
                        { x: rect.x + rect.width, y: rect.y },
                        { x: rect.x + rect.width, y: rect.y + rect.height },
                        { x: rect.x, y: rect.y + rect.height },
                    ];
                    var minX, minY, maxX, maxY;
                    var trans = this.getAbsoluteTransform(top);
                    points.forEach(function (point) {
                        var transformed = trans.point(point);
                        if (minX === undefined) {
                            minX = maxX = transformed.x;
                            minY = maxY = transformed.y;
                        }
                        minX = Math.min(minX, transformed.x);
                        minY = Math.min(minY, transformed.y);
                        maxX = Math.max(maxX, transformed.x);
                        maxY = Math.max(maxY, transformed.y);
                    });
                    return {
                        x: minX,
                        y: minY,
                        width: maxX - minX,
                        height: maxY - minY,
                    };
                }
                _drawCachedSceneCanvas(context) {
                    context.save();
                    context._applyOpacity(this);
                    context._applyGlobalCompositeOperation(this);
                    const canvasCache = this._getCanvasCache();
                    context.translate(canvasCache.x, canvasCache.y);
                    var cacheCanvas = this._getCachedSceneCanvas();
                    var ratio = cacheCanvas.pixelRatio;
                    context.drawImage(cacheCanvas._canvas, 0, 0, cacheCanvas.width / ratio, cacheCanvas.height / ratio);
                    context.restore();
                }
                _drawCachedHitCanvas(context) {
                    var canvasCache = this._getCanvasCache(), hitCanvas = canvasCache.hit;
                    context.save();
                    context.translate(canvasCache.x, canvasCache.y);
                    context.drawImage(hitCanvas._canvas, 0, 0, hitCanvas.width / hitCanvas.pixelRatio, hitCanvas.height / hitCanvas.pixelRatio);
                    context.restore();
                }
                _getCachedSceneCanvas() {
                    var filters = this.filters(), cachedCanvas = this._getCanvasCache(), sceneCanvas = cachedCanvas.scene, filterCanvas = cachedCanvas.filter, filterContext = filterCanvas.getContext(), len, imageData, n, filter;
                    if (filters) {
                        if (!this._filterUpToDate) {
                            var ratio = sceneCanvas.pixelRatio;
                            filterCanvas.setSize(sceneCanvas.width / sceneCanvas.pixelRatio, sceneCanvas.height / sceneCanvas.pixelRatio);
                            try {
                                len = filters.length;
                                filterContext.clear();
                                filterContext.drawImage(sceneCanvas._canvas, 0, 0, sceneCanvas.getWidth() / ratio, sceneCanvas.getHeight() / ratio);
                                imageData = filterContext.getImageData(0, 0, filterCanvas.getWidth(), filterCanvas.getHeight());
                                for (n = 0; n < len; n++) {
                                    filter = filters[n];
                                    if (typeof filter !== 'function') {
                                        Util.error('Filter should be type of function, but got ' +
                                            typeof filter +
                                            ' instead. Please check correct filters');
                                        continue;
                                    }
                                    filter.call(this, imageData);
                                    filterContext.putImageData(imageData, 0, 0);
                                }
                            }
                            catch (e) {
                                Util.error('Unable to apply filter. ' +
                                    e.message +
                                    ' This post my help you https://konvajs.org/docs/posts/Tainted_Canvas.html.');
                            }
                            this._filterUpToDate = true;
                        }
                        return filterCanvas;
                    }
                    return sceneCanvas;
                }
                on(evtStr, handler) {
                    this._cache && this._cache.delete(ALL_LISTENERS);
                    if (arguments.length === 3) {
                        return this._delegate.apply(this, arguments);
                    }
                    var events = evtStr.split(SPACE$1), len = events.length, n, event, parts, baseEvent, name;
                    for (n = 0; n < len; n++) {
                        event = events[n];
                        parts = event.split('.');
                        baseEvent = parts[0];
                        name = parts[1] || '';
                        if (!this.eventListeners[baseEvent]) {
                            this.eventListeners[baseEvent] = [];
                        }
                        this.eventListeners[baseEvent].push({
                            name: name,
                            handler: handler,
                        });
                    }
                    return this;
                }
                off(evtStr, callback) {
                    var events = (evtStr || '').split(SPACE$1), len = events.length, n, t, event, parts, baseEvent, name;
                    this._cache && this._cache.delete(ALL_LISTENERS);
                    if (!evtStr) {
                        for (t in this.eventListeners) {
                            this._off(t);
                        }
                    }
                    for (n = 0; n < len; n++) {
                        event = events[n];
                        parts = event.split('.');
                        baseEvent = parts[0];
                        name = parts[1];
                        if (baseEvent) {
                            if (this.eventListeners[baseEvent]) {
                                this._off(baseEvent, name, callback);
                            }
                        }
                        else {
                            for (t in this.eventListeners) {
                                this._off(t, name, callback);
                            }
                        }
                    }
                    return this;
                }
                dispatchEvent(evt) {
                    var e = {
                        target: this,
                        type: evt.type,
                        evt: evt,
                    };
                    this.fire(evt.type, e);
                    return this;
                }
                addEventListener(type, handler) {
                    this.on(type, function (evt) {
                        handler.call(this, evt.evt);
                    });
                    return this;
                }
                removeEventListener(type) {
                    this.off(type);
                    return this;
                }
                _delegate(event, selector, handler) {
                    var stopNode = this;
                    this.on(event, function (evt) {
                        var targets = evt.target.findAncestors(selector, true, stopNode);
                        for (var i = 0; i < targets.length; i++) {
                            evt = Util.cloneObject(evt);
                            evt.currentTarget = targets[i];
                            handler.call(targets[i], evt);
                        }
                    });
                }
                remove() {
                    if (this.isDragging()) {
                        this.stopDrag();
                    }
                    DD._dragElements.delete(this._id);
                    this._remove();
                    return this;
                }
                _clearCaches() {
                    this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
                    this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
                    this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);
                    this._clearSelfAndDescendantCache(STAGE$1);
                    this._clearSelfAndDescendantCache(VISIBLE);
                    this._clearSelfAndDescendantCache(LISTENING);
                }
                _remove() {
                    this._clearCaches();
                    var parent = this.getParent();
                    if (parent && parent.children) {
                        parent.children.splice(this.index, 1);
                        parent._setChildrenIndices();
                        this.parent = null;
                    }
                }
                destroy() {
                    this.remove();
                    this.clearCache();
                    return this;
                }
                getAttr(attr) {
                    var method = 'get' + Util._capitalize(attr);
                    if (Util._isFunction(this[method])) {
                        return this[method]();
                    }
                    return this.attrs[attr];
                }
                getAncestors() {
                    var parent = this.getParent(), ancestors = [];
                    while (parent) {
                        ancestors.push(parent);
                        parent = parent.getParent();
                    }
                    return ancestors;
                }
                getAttrs() {
                    return this.attrs || {};
                }
                setAttrs(config) {
                    this._batchTransformChanges(() => {
                        var key, method;
                        if (!config) {
                            return this;
                        }
                        for (key in config) {
                            if (key === CHILDREN) {
                                continue;
                            }
                            method = SET + Util._capitalize(key);
                            if (Util._isFunction(this[method])) {
                                this[method](config[key]);
                            }
                            else {
                                this._setAttr(key, config[key]);
                            }
                        }
                    });
                    return this;
                }
                isListening() {
                    return this._getCache(LISTENING, this._isListening);
                }
                _isListening(relativeTo) {
                    const listening = this.listening();
                    if (!listening) {
                        return false;
                    }
                    const parent = this.getParent();
                    if (parent && parent !== relativeTo && this !== relativeTo) {
                        return parent._isListening(relativeTo);
                    }
                    else {
                        return true;
                    }
                }
                isVisible() {
                    return this._getCache(VISIBLE, this._isVisible);
                }
                _isVisible(relativeTo) {
                    const visible = this.visible();
                    if (!visible) {
                        return false;
                    }
                    const parent = this.getParent();
                    if (parent && parent !== relativeTo && this !== relativeTo) {
                        return parent._isVisible(relativeTo);
                    }
                    else {
                        return true;
                    }
                }
                shouldDrawHit(top, skipDragCheck = false) {
                    if (top) {
                        return this._isVisible(top) && this._isListening(top);
                    }
                    var layer = this.getLayer();
                    var layerUnderDrag = false;
                    DD._dragElements.forEach((elem) => {
                        if (elem.dragStatus !== 'dragging') {
                            return;
                        }
                        else if (elem.node.nodeType === 'Stage') {
                            layerUnderDrag = true;
                        }
                        else if (elem.node.getLayer() === layer) {
                            layerUnderDrag = true;
                        }
                    });
                    var dragSkip = !skipDragCheck && !Konva$2.hitOnDragEnabled && layerUnderDrag;
                    return this.isListening() && this.isVisible() && !dragSkip;
                }
                show() {
                    this.visible(true);
                    return this;
                }
                hide() {
                    this.visible(false);
                    return this;
                }
                getZIndex() {
                    return this.index || 0;
                }
                getAbsoluteZIndex() {
                    var depth = this.getDepth(), that = this, index = 0, nodes, len, n, child;
                    function addChildren(children) {
                        nodes = [];
                        len = children.length;
                        for (n = 0; n < len; n++) {
                            child = children[n];
                            index++;
                            if (child.nodeType !== SHAPE) {
                                nodes = nodes.concat(child.getChildren().slice());
                            }
                            if (child._id === that._id) {
                                n = len;
                            }
                        }
                        if (nodes.length > 0 && nodes[0].getDepth() <= depth) {
                            addChildren(nodes);
                        }
                    }
                    if (that.nodeType !== UPPER_STAGE) {
                        addChildren(that.getStage().getChildren());
                    }
                    return index;
                }
                getDepth() {
                    var depth = 0, parent = this.parent;
                    while (parent) {
                        depth++;
                        parent = parent.parent;
                    }
                    return depth;
                }
                _batchTransformChanges(func) {
                    this._batchingTransformChange = true;
                    func();
                    this._batchingTransformChange = false;
                    if (this._needClearTransformCache) {
                        this._clearCache(TRANSFORM);
                        this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
                    }
                    this._needClearTransformCache = false;
                }
                setPosition(pos) {
                    this._batchTransformChanges(() => {
                        this.x(pos.x);
                        this.y(pos.y);
                    });
                    return this;
                }
                getPosition() {
                    return {
                        x: this.x(),
                        y: this.y(),
                    };
                }
                getRelativePointerPosition() {
                    if (!this.getStage()) {
                        return null;
                    }
                    var pos = this.getStage().getPointerPosition();
                    if (!pos) {
                        return null;
                    }
                    var transform = this.getAbsoluteTransform().copy();
                    transform.invert();
                    return transform.point(pos);
                }
                getAbsolutePosition(top) {
                    let haveCachedParent = false;
                    let parent = this.parent;
                    while (parent) {
                        if (parent.isCached()) {
                            haveCachedParent = true;
                            break;
                        }
                        parent = parent.parent;
                    }
                    if (haveCachedParent && !top) {
                        top = true;
                    }
                    var absoluteMatrix = this.getAbsoluteTransform(top).getMatrix(), absoluteTransform = new Transform(), offset = this.offset();
                    absoluteTransform.m = absoluteMatrix.slice();
                    absoluteTransform.translate(offset.x, offset.y);
                    return absoluteTransform.getTranslation();
                }
                setAbsolutePosition(pos) {
                    var origTrans = this._clearTransform();
                    this.attrs.x = origTrans.x;
                    this.attrs.y = origTrans.y;
                    delete origTrans.x;
                    delete origTrans.y;
                    this._clearCache(TRANSFORM);
                    var it = this._getAbsoluteTransform().copy();
                    it.invert();
                    it.translate(pos.x, pos.y);
                    pos = {
                        x: this.attrs.x + it.getTranslation().x,
                        y: this.attrs.y + it.getTranslation().y,
                    };
                    this._setTransform(origTrans);
                    this.setPosition({ x: pos.x, y: pos.y });
                    this._clearCache(TRANSFORM);
                    this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
                    return this;
                }
                _setTransform(trans) {
                    var key;
                    for (key in trans) {
                        this.attrs[key] = trans[key];
                    }
                }
                _clearTransform() {
                    var trans = {
                        x: this.x(),
                        y: this.y(),
                        rotation: this.rotation(),
                        scaleX: this.scaleX(),
                        scaleY: this.scaleY(),
                        offsetX: this.offsetX(),
                        offsetY: this.offsetY(),
                        skewX: this.skewX(),
                        skewY: this.skewY(),
                    };
                    this.attrs.x = 0;
                    this.attrs.y = 0;
                    this.attrs.rotation = 0;
                    this.attrs.scaleX = 1;
                    this.attrs.scaleY = 1;
                    this.attrs.offsetX = 0;
                    this.attrs.offsetY = 0;
                    this.attrs.skewX = 0;
                    this.attrs.skewY = 0;
                    return trans;
                }
                move(change) {
                    var changeX = change.x, changeY = change.y, x = this.x(), y = this.y();
                    if (changeX !== undefined) {
                        x += changeX;
                    }
                    if (changeY !== undefined) {
                        y += changeY;
                    }
                    this.setPosition({ x: x, y: y });
                    return this;
                }
                _eachAncestorReverse(func, top) {
                    var family = [], parent = this.getParent(), len, n;
                    if (top && top._id === this._id) {
                        return;
                    }
                    family.unshift(this);
                    while (parent && (!top || parent._id !== top._id)) {
                        family.unshift(parent);
                        parent = parent.parent;
                    }
                    len = family.length;
                    for (n = 0; n < len; n++) {
                        func(family[n]);
                    }
                }
                rotate(theta) {
                    this.rotation(this.rotation() + theta);
                    return this;
                }
                moveToTop() {
                    if (!this.parent) {
                        Util.warn('Node has no parent. moveToTop function is ignored.');
                        return false;
                    }
                    var index = this.index, len = this.parent.getChildren().length;
                    if (index < len - 1) {
                        this.parent.children.splice(index, 1);
                        this.parent.children.push(this);
                        this.parent._setChildrenIndices();
                        return true;
                    }
                    return false;
                }
                moveUp() {
                    if (!this.parent) {
                        Util.warn('Node has no parent. moveUp function is ignored.');
                        return false;
                    }
                    var index = this.index, len = this.parent.getChildren().length;
                    if (index < len - 1) {
                        this.parent.children.splice(index, 1);
                        this.parent.children.splice(index + 1, 0, this);
                        this.parent._setChildrenIndices();
                        return true;
                    }
                    return false;
                }
                moveDown() {
                    if (!this.parent) {
                        Util.warn('Node has no parent. moveDown function is ignored.');
                        return false;
                    }
                    var index = this.index;
                    if (index > 0) {
                        this.parent.children.splice(index, 1);
                        this.parent.children.splice(index - 1, 0, this);
                        this.parent._setChildrenIndices();
                        return true;
                    }
                    return false;
                }
                moveToBottom() {
                    if (!this.parent) {
                        Util.warn('Node has no parent. moveToBottom function is ignored.');
                        return false;
                    }
                    var index = this.index;
                    if (index > 0) {
                        this.parent.children.splice(index, 1);
                        this.parent.children.unshift(this);
                        this.parent._setChildrenIndices();
                        return true;
                    }
                    return false;
                }
                setZIndex(zIndex) {
                    if (!this.parent) {
                        Util.warn('Node has no parent. zIndex parameter is ignored.');
                        return this;
                    }
                    if (zIndex < 0 || zIndex >= this.parent.children.length) {
                        Util.warn('Unexpected value ' +
                            zIndex +
                            ' for zIndex property. zIndex is just index of a node in children of its parent. Expected value is from 0 to ' +
                            (this.parent.children.length - 1) +
                            '.');
                    }
                    var index = this.index;
                    this.parent.children.splice(index, 1);
                    this.parent.children.splice(zIndex, 0, this);
                    this.parent._setChildrenIndices();
                    return this;
                }
                getAbsoluteOpacity() {
                    return this._getCache(ABSOLUTE_OPACITY, this._getAbsoluteOpacity);
                }
                _getAbsoluteOpacity() {
                    var absOpacity = this.opacity();
                    var parent = this.getParent();
                    if (parent && !parent._isUnderCache) {
                        absOpacity *= parent.getAbsoluteOpacity();
                    }
                    return absOpacity;
                }
                moveTo(newContainer) {
                    if (this.getParent() !== newContainer) {
                        this._remove();
                        newContainer.add(this);
                    }
                    return this;
                }
                toObject() {
                    var obj = {}, attrs = this.getAttrs(), key, val, getter, defaultValue, nonPlainObject;
                    obj.attrs = {};
                    for (key in attrs) {
                        val = attrs[key];
                        nonPlainObject =
                            Util.isObject(val) && !Util._isPlainObject(val) && !Util._isArray(val);
                        if (nonPlainObject) {
                            continue;
                        }
                        getter = typeof this[key] === 'function' && this[key];
                        delete attrs[key];
                        defaultValue = getter ? getter.call(this) : null;
                        attrs[key] = val;
                        if (defaultValue !== val) {
                            obj.attrs[key] = val;
                        }
                    }
                    obj.className = this.getClassName();
                    return Util._prepareToStringify(obj);
                }
                toJSON() {
                    return JSON.stringify(this.toObject());
                }
                getParent() {
                    return this.parent;
                }
                findAncestors(selector, includeSelf, stopNode) {
                    var res = [];
                    if (includeSelf && this._isMatch(selector)) {
                        res.push(this);
                    }
                    var ancestor = this.parent;
                    while (ancestor) {
                        if (ancestor === stopNode) {
                            return res;
                        }
                        if (ancestor._isMatch(selector)) {
                            res.push(ancestor);
                        }
                        ancestor = ancestor.parent;
                    }
                    return res;
                }
                isAncestorOf(node) {
                    return false;
                }
                findAncestor(selector, includeSelf, stopNode) {
                    return this.findAncestors(selector, includeSelf, stopNode)[0];
                }
                _isMatch(selector) {
                    if (!selector) {
                        return false;
                    }
                    if (typeof selector === 'function') {
                        return selector(this);
                    }
                    var selectorArr = selector.replace(/ /g, '').split(','), len = selectorArr.length, n, sel;
                    for (n = 0; n < len; n++) {
                        sel = selectorArr[n];
                        if (!Util.isValidSelector(sel)) {
                            Util.warn('Selector "' +
                                sel +
                                '" is invalid. Allowed selectors examples are "#foo", ".bar" or "Group".');
                            Util.warn('If you have a custom shape with such className, please change it to start with upper letter like "Triangle".');
                            Util.warn('Konva is awesome, right?');
                        }
                        if (sel.charAt(0) === '#') {
                            if (this.id() === sel.slice(1)) {
                                return true;
                            }
                        }
                        else if (sel.charAt(0) === '.') {
                            if (this.hasName(sel.slice(1))) {
                                return true;
                            }
                        }
                        else if (this.className === sel || this.nodeType === sel) {
                            return true;
                        }
                    }
                    return false;
                }
                getLayer() {
                    var parent = this.getParent();
                    return parent ? parent.getLayer() : null;
                }
                getStage() {
                    return this._getCache(STAGE$1, this._getStage);
                }
                _getStage() {
                    var parent = this.getParent();
                    if (parent) {
                        return parent.getStage();
                    }
                    else {
                        return undefined;
                    }
                }
                fire(eventType, evt = {}, bubble) {
                    evt.target = evt.target || this;
                    if (bubble) {
                        this._fireAndBubble(eventType, evt);
                    }
                    else {
                        this._fire(eventType, evt);
                    }
                    return this;
                }
                getAbsoluteTransform(top) {
                    if (top) {
                        return this._getAbsoluteTransform(top);
                    }
                    else {
                        return this._getCache(ABSOLUTE_TRANSFORM, this._getAbsoluteTransform);
                    }
                }
                _getAbsoluteTransform(top) {
                    var at;
                    if (top) {
                        at = new Transform();
                        this._eachAncestorReverse(function (node) {
                            var transformsEnabled = node.transformsEnabled();
                            if (transformsEnabled === 'all') {
                                at.multiply(node.getTransform());
                            }
                            else if (transformsEnabled === 'position') {
                                at.translate(node.x() - node.offsetX(), node.y() - node.offsetY());
                            }
                        }, top);
                        return at;
                    }
                    else {
                        at = this._cache.get(ABSOLUTE_TRANSFORM) || new Transform();
                        if (this.parent) {
                            this.parent.getAbsoluteTransform().copyInto(at);
                        }
                        else {
                            at.reset();
                        }
                        var transformsEnabled = this.transformsEnabled();
                        if (transformsEnabled === 'all') {
                            at.multiply(this.getTransform());
                        }
                        else if (transformsEnabled === 'position') {
                            const x = this.attrs.x || 0;
                            const y = this.attrs.y || 0;
                            const offsetX = this.attrs.offsetX || 0;
                            const offsetY = this.attrs.offsetY || 0;
                            at.translate(x - offsetX, y - offsetY);
                        }
                        at.dirty = false;
                        return at;
                    }
                }
                getAbsoluteScale(top) {
                    var parent = this;
                    while (parent) {
                        if (parent._isUnderCache) {
                            top = parent;
                        }
                        parent = parent.getParent();
                    }
                    const transform = this.getAbsoluteTransform(top);
                    const attrs = transform.decompose();
                    return {
                        x: attrs.scaleX,
                        y: attrs.scaleY,
                    };
                }
                getAbsoluteRotation() {
                    return this.getAbsoluteTransform().decompose().rotation;
                }
                getTransform() {
                    return this._getCache(TRANSFORM, this._getTransform);
                }
                _getTransform() {
                    var _a, _b;
                    var m = this._cache.get(TRANSFORM) || new Transform();
                    m.reset();
                    var x = this.x(), y = this.y(), rotation = Konva$2.getAngle(this.rotation()), scaleX = (_a = this.attrs.scaleX) !== null && _a !== void 0 ? _a : 1, scaleY = (_b = this.attrs.scaleY) !== null && _b !== void 0 ? _b : 1, skewX = this.attrs.skewX || 0, skewY = this.attrs.skewY || 0, offsetX = this.attrs.offsetX || 0, offsetY = this.attrs.offsetY || 0;
                    if (x !== 0 || y !== 0) {
                        m.translate(x, y);
                    }
                    if (rotation !== 0) {
                        m.rotate(rotation);
                    }
                    if (skewX !== 0 || skewY !== 0) {
                        m.skew(skewX, skewY);
                    }
                    if (scaleX !== 1 || scaleY !== 1) {
                        m.scale(scaleX, scaleY);
                    }
                    if (offsetX !== 0 || offsetY !== 0) {
                        m.translate(-1 * offsetX, -1 * offsetY);
                    }
                    m.dirty = false;
                    return m;
                }
                clone(obj) {
                    var attrs = Util.cloneObject(this.attrs), key, allListeners, len, n, listener;
                    for (key in obj) {
                        attrs[key] = obj[key];
                    }
                    var node = new this.constructor(attrs);
                    for (key in this.eventListeners) {
                        allListeners = this.eventListeners[key];
                        len = allListeners.length;
                        for (n = 0; n < len; n++) {
                            listener = allListeners[n];
                            if (listener.name.indexOf(KONVA) < 0) {
                                if (!node.eventListeners[key]) {
                                    node.eventListeners[key] = [];
                                }
                                node.eventListeners[key].push(listener);
                            }
                        }
                    }
                    return node;
                }
                _toKonvaCanvas(config) {
                    config = config || {};
                    var box = this.getClientRect();
                    var stage = this.getStage(), x = config.x !== undefined ? config.x : Math.floor(box.x), y = config.y !== undefined ? config.y : Math.floor(box.y), pixelRatio = config.pixelRatio || 1, canvas = new SceneCanvas({
                        width: config.width || Math.ceil(box.width) || (stage ? stage.width() : 0),
                        height: config.height ||
                            Math.ceil(box.height) ||
                            (stage ? stage.height() : 0),
                        pixelRatio: pixelRatio,
                    }), context = canvas.getContext();
                    if (config.imageSmoothingEnabled === false) {
                        context._context.imageSmoothingEnabled = false;
                    }
                    context.save();
                    if (x || y) {
                        context.translate(-1 * x, -1 * y);
                    }
                    this.drawScene(canvas);
                    context.restore();
                    return canvas;
                }
                toCanvas(config) {
                    return this._toKonvaCanvas(config)._canvas;
                }
                toDataURL(config) {
                    config = config || {};
                    var mimeType = config.mimeType || null, quality = config.quality || null;
                    var url = this._toKonvaCanvas(config).toDataURL(mimeType, quality);
                    if (config.callback) {
                        config.callback(url);
                    }
                    return url;
                }
                toImage(config) {
                    return new Promise((resolve, reject) => {
                        try {
                            const callback = config === null || config === void 0 ? void 0 : config.callback;
                            if (callback)
                                delete config.callback;
                            Util._urlToImage(this.toDataURL(config), function (img) {
                                resolve(img);
                                callback === null || callback === void 0 ? void 0 : callback(img);
                            });
                        }
                        catch (err) {
                            reject(err);
                        }
                    });
                }
                toBlob(config) {
                    return new Promise((resolve, reject) => {
                        try {
                            const callback = config === null || config === void 0 ? void 0 : config.callback;
                            if (callback)
                                delete config.callback;
                            this.toCanvas(config).toBlob((blob) => {
                                resolve(blob);
                                callback === null || callback === void 0 ? void 0 : callback(blob);
                            });
                        }
                        catch (err) {
                            reject(err);
                        }
                    });
                }
                setSize(size) {
                    this.width(size.width);
                    this.height(size.height);
                    return this;
                }
                getSize() {
                    return {
                        width: this.width(),
                        height: this.height(),
                    };
                }
                getClassName() {
                    return this.className || this.nodeType;
                }
                getType() {
                    return this.nodeType;
                }
                getDragDistance() {
                    if (this.attrs.dragDistance !== undefined) {
                        return this.attrs.dragDistance;
                    }
                    else if (this.parent) {
                        return this.parent.getDragDistance();
                    }
                    else {
                        return Konva$2.dragDistance;
                    }
                }
                _off(type, name, callback) {
                    var evtListeners = this.eventListeners[type], i, evtName, handler;
                    for (i = 0; i < evtListeners.length; i++) {
                        evtName = evtListeners[i].name;
                        handler = evtListeners[i].handler;
                        if ((evtName !== 'konva' || name === 'konva') &&
                            (!name || evtName === name) &&
                            (!callback || callback === handler)) {
                            evtListeners.splice(i, 1);
                            if (evtListeners.length === 0) {
                                delete this.eventListeners[type];
                                break;
                            }
                            i--;
                        }
                    }
                }
                _fireChangeEvent(attr, oldVal, newVal) {
                    this._fire(attr + CHANGE, {
                        oldVal: oldVal,
                        newVal: newVal,
                    });
                }
                addName(name) {
                    if (!this.hasName(name)) {
                        var oldName = this.name();
                        var newName = oldName ? oldName + ' ' + name : name;
                        this.name(newName);
                    }
                    return this;
                }
                hasName(name) {
                    if (!name) {
                        return false;
                    }
                    const fullName = this.name();
                    if (!fullName) {
                        return false;
                    }
                    var names = (fullName || '').split(/\s/g);
                    return names.indexOf(name) !== -1;
                }
                removeName(name) {
                    var names = (this.name() || '').split(/\s/g);
                    var index = names.indexOf(name);
                    if (index !== -1) {
                        names.splice(index, 1);
                        this.name(names.join(' '));
                    }
                    return this;
                }
                setAttr(attr, val) {
                    var func = this[SET + Util._capitalize(attr)];
                    if (Util._isFunction(func)) {
                        func.call(this, val);
                    }
                    else {
                        this._setAttr(attr, val);
                    }
                    return this;
                }
                _requestDraw() {
                    if (Konva$2.autoDrawEnabled) {
                        const drawNode = this.getLayer() || this.getStage();
                        drawNode === null || drawNode === void 0 ? void 0 : drawNode.batchDraw();
                    }
                }
                _setAttr(key, val) {
                    var oldVal = this.attrs[key];
                    if (oldVal === val && !Util.isObject(val)) {
                        return;
                    }
                    if (val === undefined || val === null) {
                        delete this.attrs[key];
                    }
                    else {
                        this.attrs[key] = val;
                    }
                    if (this._shouldFireChangeEvents) {
                        this._fireChangeEvent(key, oldVal, val);
                    }
                    this._requestDraw();
                }
                _setComponentAttr(key, component, val) {
                    var oldVal;
                    if (val !== undefined) {
                        oldVal = this.attrs[key];
                        if (!oldVal) {
                            this.attrs[key] = this.getAttr(key);
                        }
                        this.attrs[key][component] = val;
                        this._fireChangeEvent(key, oldVal, val);
                    }
                }
                _fireAndBubble(eventType, evt, compareShape) {
                    if (evt && this.nodeType === SHAPE) {
                        evt.target = this;
                    }
                    var shouldStop = (eventType === MOUSEENTER$1 || eventType === MOUSELEAVE$1) &&
                        ((compareShape &&
                            (this === compareShape ||
                                (this.isAncestorOf && this.isAncestorOf(compareShape)))) ||
                            (this.nodeType === 'Stage' && !compareShape));
                    if (!shouldStop) {
                        this._fire(eventType, evt);
                        var stopBubble = (eventType === MOUSEENTER$1 || eventType === MOUSELEAVE$1) &&
                            compareShape &&
                            compareShape.isAncestorOf &&
                            compareShape.isAncestorOf(this) &&
                            !compareShape.isAncestorOf(this.parent);
                        if (((evt && !evt.cancelBubble) || !evt) &&
                            this.parent &&
                            this.parent.isListening() &&
                            !stopBubble) {
                            if (compareShape && compareShape.parent) {
                                this._fireAndBubble.call(this.parent, eventType, evt, compareShape);
                            }
                            else {
                                this._fireAndBubble.call(this.parent, eventType, evt);
                            }
                        }
                    }
                }
                _getProtoListeners(eventType) {
                    let listeners = this._cache.get(ALL_LISTENERS);
                    if (!listeners) {
                        listeners = {};
                        let obj = Object.getPrototypeOf(this);
                        while (obj) {
                            if (!obj.eventListeners) {
                                obj = Object.getPrototypeOf(obj);
                                continue;
                            }
                            for (var event in obj.eventListeners) {
                                const newEvents = obj.eventListeners[event];
                                const oldEvents = listeners[event] || [];
                                listeners[event] = newEvents.concat(oldEvents);
                            }
                            obj = Object.getPrototypeOf(obj);
                        }
                        this._cache.set(ALL_LISTENERS, listeners);
                    }
                    return listeners[eventType];
                }
                _fire(eventType, evt) {
                    evt = evt || {};
                    evt.currentTarget = this;
                    evt.type = eventType;
                    const topListeners = this._getProtoListeners(eventType);
                    if (topListeners) {
                        for (var i = 0; i < topListeners.length; i++) {
                            topListeners[i].handler.call(this, evt);
                        }
                    }
                    const selfListeners = this.eventListeners[eventType];
                    if (selfListeners) {
                        for (var i = 0; i < selfListeners.length; i++) {
                            selfListeners[i].handler.call(this, evt);
                        }
                    }
                }
                draw() {
                    this.drawScene();
                    this.drawHit();
                    return this;
                }
                _createDragElement(evt) {
                    var pointerId = evt ? evt.pointerId : undefined;
                    var stage = this.getStage();
                    var ap = this.getAbsolutePosition();
                    var pos = stage._getPointerById(pointerId) ||
                        stage._changedPointerPositions[0] ||
                        ap;
                    DD._dragElements.set(this._id, {
                        node: this,
                        startPointerPos: pos,
                        offset: {
                            x: pos.x - ap.x,
                            y: pos.y - ap.y,
                        },
                        dragStatus: 'ready',
                        pointerId,
                    });
                }
                startDrag(evt, bubbleEvent = true) {
                    if (!DD._dragElements.has(this._id)) {
                        this._createDragElement(evt);
                    }
                    const elem = DD._dragElements.get(this._id);
                    elem.dragStatus = 'dragging';
                    this.fire('dragstart', {
                        type: 'dragstart',
                        target: this,
                        evt: evt && evt.evt,
                    }, bubbleEvent);
                }
                _setDragPosition(evt, elem) {
                    const pos = this.getStage()._getPointerById(elem.pointerId);
                    if (!pos) {
                        return;
                    }
                    var newNodePos = {
                        x: pos.x - elem.offset.x,
                        y: pos.y - elem.offset.y,
                    };
                    var dbf = this.dragBoundFunc();
                    if (dbf !== undefined) {
                        const bounded = dbf.call(this, newNodePos, evt);
                        if (!bounded) {
                            Util.warn('dragBoundFunc did not return any value. That is unexpected behavior. You must return new absolute position from dragBoundFunc.');
                        }
                        else {
                            newNodePos = bounded;
                        }
                    }
                    if (!this._lastPos ||
                        this._lastPos.x !== newNodePos.x ||
                        this._lastPos.y !== newNodePos.y) {
                        this.setAbsolutePosition(newNodePos);
                        this._requestDraw();
                    }
                    this._lastPos = newNodePos;
                }
                stopDrag(evt) {
                    const elem = DD._dragElements.get(this._id);
                    if (elem) {
                        elem.dragStatus = 'stopped';
                    }
                    DD._endDragBefore(evt);
                    DD._endDragAfter(evt);
                }
                setDraggable(draggable) {
                    this._setAttr('draggable', draggable);
                    this._dragChange();
                }
                isDragging() {
                    const elem = DD._dragElements.get(this._id);
                    return elem ? elem.dragStatus === 'dragging' : false;
                }
                _listenDrag() {
                    this._dragCleanup();
                    this.on('mousedown.konva touchstart.konva', function (evt) {
                        var shouldCheckButton = evt.evt['button'] !== undefined;
                        var canDrag = !shouldCheckButton || Konva$2.dragButtons.indexOf(evt.evt['button']) >= 0;
                        if (!canDrag) {
                            return;
                        }
                        if (this.isDragging()) {
                            return;
                        }
                        var hasDraggingChild = false;
                        DD._dragElements.forEach((elem) => {
                            if (this.isAncestorOf(elem.node)) {
                                hasDraggingChild = true;
                            }
                        });
                        if (!hasDraggingChild) {
                            this._createDragElement(evt);
                        }
                    });
                }
                _dragChange() {
                    if (this.attrs.draggable) {
                        this._listenDrag();
                    }
                    else {
                        this._dragCleanup();
                        var stage = this.getStage();
                        if (!stage) {
                            return;
                        }
                        const dragElement = DD._dragElements.get(this._id);
                        const isDragging = dragElement && dragElement.dragStatus === 'dragging';
                        const isReady = dragElement && dragElement.dragStatus === 'ready';
                        if (isDragging) {
                            this.stopDrag();
                        }
                        else if (isReady) {
                            DD._dragElements.delete(this._id);
                        }
                    }
                }
                _dragCleanup() {
                    this.off('mousedown.konva');
                    this.off('touchstart.konva');
                }
                isClientRectOnScreen(margin = { x: 0, y: 0 }) {
                    const stage = this.getStage();
                    if (!stage) {
                        return false;
                    }
                    const screenRect = {
                        x: -margin.x,
                        y: -margin.y,
                        width: stage.width() + 2 * margin.x,
                        height: stage.height() + 2 * margin.y,
                    };
                    return Util.haveIntersection(screenRect, this.getClientRect());
                }
                static create(data, container) {
                    if (Util._isString(data)) {
                        data = JSON.parse(data);
                    }
                    return this._createNode(data, container);
                }
                static _createNode(obj, container) {
                    var className = Node.prototype.getClassName.call(obj), children = obj.children, no, len, n;
                    if (container) {
                        obj.attrs.container = container;
                    }
                    if (!Konva$2[className]) {
                        Util.warn('Can not find a node with class name "' +
                            className +
                            '". Fallback to "Shape".');
                        className = 'Shape';
                    }
                    const Class = Konva$2[className];
                    no = new Class(obj.attrs);
                    if (children) {
                        len = children.length;
                        for (n = 0; n < len; n++) {
                            no.add(Node._createNode(children[n]));
                        }
                    }
                    return no;
                }
            }
            Node.prototype.nodeType = 'Node';
            Node.prototype._attrsAffectingSize = [];
            Node.prototype.eventListeners = {};
            Node.prototype.on.call(Node.prototype, TRANSFORM_CHANGE_STR$1, function () {
                if (this._batchingTransformChange) {
                    this._needClearTransformCache = true;
                    return;
                }
                this._clearCache(TRANSFORM);
                this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
            });
            Node.prototype.on.call(Node.prototype, 'visibleChange.konva', function () {
                this._clearSelfAndDescendantCache(VISIBLE);
            });
            Node.prototype.on.call(Node.prototype, 'listeningChange.konva', function () {
                this._clearSelfAndDescendantCache(LISTENING);
            });
            Node.prototype.on.call(Node.prototype, 'opacityChange.konva', function () {
                this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
            });
            const addGetterSetter = Factory.addGetterSetter;
            addGetterSetter(Node, 'zIndex');
            addGetterSetter(Node, 'absolutePosition');
            addGetterSetter(Node, 'position');
            addGetterSetter(Node, 'x', 0, getNumberValidator());
            addGetterSetter(Node, 'y', 0, getNumberValidator());
            addGetterSetter(Node, 'globalCompositeOperation', 'source-over', getStringValidator());
            addGetterSetter(Node, 'opacity', 1, getNumberValidator());
            addGetterSetter(Node, 'name', '', getStringValidator());
            addGetterSetter(Node, 'id', '', getStringValidator());
            addGetterSetter(Node, 'rotation', 0, getNumberValidator());
            Factory.addComponentsGetterSetter(Node, 'scale', ['x', 'y']);
            addGetterSetter(Node, 'scaleX', 1, getNumberValidator());
            addGetterSetter(Node, 'scaleY', 1, getNumberValidator());
            Factory.addComponentsGetterSetter(Node, 'skew', ['x', 'y']);
            addGetterSetter(Node, 'skewX', 0, getNumberValidator());
            addGetterSetter(Node, 'skewY', 0, getNumberValidator());
            Factory.addComponentsGetterSetter(Node, 'offset', ['x', 'y']);
            addGetterSetter(Node, 'offsetX', 0, getNumberValidator());
            addGetterSetter(Node, 'offsetY', 0, getNumberValidator());
            addGetterSetter(Node, 'dragDistance', null, getNumberValidator());
            addGetterSetter(Node, 'width', 0, getNumberValidator());
            addGetterSetter(Node, 'height', 0, getNumberValidator());
            addGetterSetter(Node, 'listening', true, getBooleanValidator());
            addGetterSetter(Node, 'preventDefault', true, getBooleanValidator());
            addGetterSetter(Node, 'filters', null, function (val) {
                this._filterUpToDate = false;
                return val;
            });
            addGetterSetter(Node, 'visible', true, getBooleanValidator());
            addGetterSetter(Node, 'transformsEnabled', 'all', getStringValidator());
            addGetterSetter(Node, 'size');
            addGetterSetter(Node, 'dragBoundFunc');
            addGetterSetter(Node, 'draggable', false, getBooleanValidator());
            Factory.backCompat(Node, {
                rotateDeg: 'rotate',
                setRotationDeg: 'setRotation',
                getRotationDeg: 'getRotation',
            });

            class Container extends Node {
                constructor() {
                    super(...arguments);
                    this.children = [];
                }
                getChildren(filterFunc) {
                    if (!filterFunc) {
                        return this.children || [];
                    }
                    const children = this.children || [];
                    var results = [];
                    children.forEach(function (child) {
                        if (filterFunc(child)) {
                            results.push(child);
                        }
                    });
                    return results;
                }
                hasChildren() {
                    return this.getChildren().length > 0;
                }
                removeChildren() {
                    this.getChildren().forEach((child) => {
                        child.parent = null;
                        child.index = 0;
                        child.remove();
                    });
                    this.children = [];
                    this._requestDraw();
                    return this;
                }
                destroyChildren() {
                    this.getChildren().forEach((child) => {
                        child.parent = null;
                        child.index = 0;
                        child.destroy();
                    });
                    this.children = [];
                    this._requestDraw();
                    return this;
                }
                add(...children) {
                    if (children.length === 0) {
                        return this;
                    }
                    if (children.length > 1) {
                        for (var i = 0; i < children.length; i++) {
                            this.add(children[i]);
                        }
                        return this;
                    }
                    const child = children[0];
                    if (child.getParent()) {
                        child.moveTo(this);
                        return this;
                    }
                    this._validateAdd(child);
                    child.index = this.getChildren().length;
                    child.parent = this;
                    child._clearCaches();
                    this.getChildren().push(child);
                    this._fire('add', {
                        child: child,
                    });
                    this._requestDraw();
                    return this;
                }
                destroy() {
                    if (this.hasChildren()) {
                        this.destroyChildren();
                    }
                    super.destroy();
                    return this;
                }
                find(selector) {
                    return this._generalFind(selector, false);
                }
                findOne(selector) {
                    var result = this._generalFind(selector, true);
                    return result.length > 0 ? result[0] : undefined;
                }
                _generalFind(selector, findOne) {
                    var retArr = [];
                    this._descendants((node) => {
                        const valid = node._isMatch(selector);
                        if (valid) {
                            retArr.push(node);
                        }
                        if (valid && findOne) {
                            return true;
                        }
                        return false;
                    });
                    return retArr;
                }
                _descendants(fn) {
                    let shouldStop = false;
                    const children = this.getChildren();
                    for (const child of children) {
                        shouldStop = fn(child);
                        if (shouldStop) {
                            return true;
                        }
                        if (!child.hasChildren()) {
                            continue;
                        }
                        shouldStop = child._descendants(fn);
                        if (shouldStop) {
                            return true;
                        }
                    }
                    return false;
                }
                toObject() {
                    var obj = Node.prototype.toObject.call(this);
                    obj.children = [];
                    this.getChildren().forEach((child) => {
                        obj.children.push(child.toObject());
                    });
                    return obj;
                }
                isAncestorOf(node) {
                    var parent = node.getParent();
                    while (parent) {
                        if (parent._id === this._id) {
                            return true;
                        }
                        parent = parent.getParent();
                    }
                    return false;
                }
                clone(obj) {
                    var node = Node.prototype.clone.call(this, obj);
                    this.getChildren().forEach(function (no) {
                        node.add(no.clone());
                    });
                    return node;
                }
                getAllIntersections(pos) {
                    var arr = [];
                    this.find('Shape').forEach(function (shape) {
                        if (shape.isVisible() && shape.intersects(pos)) {
                            arr.push(shape);
                        }
                    });
                    return arr;
                }
                _clearSelfAndDescendantCache(attr) {
                    var _a;
                    super._clearSelfAndDescendantCache(attr);
                    if (this.isCached()) {
                        return;
                    }
                    (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function (node) {
                        node._clearSelfAndDescendantCache(attr);
                    });
                }
                _setChildrenIndices() {
                    var _a;
                    (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function (child, n) {
                        child.index = n;
                    });
                    this._requestDraw();
                }
                drawScene(can, top) {
                    var layer = this.getLayer(), canvas = can || (layer && layer.getCanvas()), context = canvas && canvas.getContext(), cachedCanvas = this._getCanvasCache(), cachedSceneCanvas = cachedCanvas && cachedCanvas.scene;
                    var caching = canvas && canvas.isCache;
                    if (!this.isVisible() && !caching) {
                        return this;
                    }
                    if (cachedSceneCanvas) {
                        context.save();
                        var m = this.getAbsoluteTransform(top).getMatrix();
                        context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                        this._drawCachedSceneCanvas(context);
                        context.restore();
                    }
                    else {
                        this._drawChildren('drawScene', canvas, top);
                    }
                    return this;
                }
                drawHit(can, top) {
                    if (!this.shouldDrawHit(top)) {
                        return this;
                    }
                    var layer = this.getLayer(), canvas = can || (layer && layer.hitCanvas), context = canvas && canvas.getContext(), cachedCanvas = this._getCanvasCache(), cachedHitCanvas = cachedCanvas && cachedCanvas.hit;
                    if (cachedHitCanvas) {
                        context.save();
                        var m = this.getAbsoluteTransform(top).getMatrix();
                        context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                        this._drawCachedHitCanvas(context);
                        context.restore();
                    }
                    else {
                        this._drawChildren('drawHit', canvas, top);
                    }
                    return this;
                }
                _drawChildren(drawMethod, canvas, top) {
                    var _a;
                    var context = canvas && canvas.getContext(), clipWidth = this.clipWidth(), clipHeight = this.clipHeight(), clipFunc = this.clipFunc(), hasClip = (clipWidth && clipHeight) || clipFunc;
                    const selfCache = top === this;
                    if (hasClip) {
                        context.save();
                        var transform = this.getAbsoluteTransform(top);
                        var m = transform.getMatrix();
                        context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                        context.beginPath();
                        if (clipFunc) {
                            clipFunc.call(this, context, this);
                        }
                        else {
                            var clipX = this.clipX();
                            var clipY = this.clipY();
                            context.rect(clipX, clipY, clipWidth, clipHeight);
                        }
                        context.clip();
                        m = transform.copy().invert().getMatrix();
                        context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                    }
                    var hasComposition = !selfCache &&
                        this.globalCompositeOperation() !== 'source-over' &&
                        drawMethod === 'drawScene';
                    if (hasComposition) {
                        context.save();
                        context._applyGlobalCompositeOperation(this);
                    }
                    (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function (child) {
                        child[drawMethod](canvas, top);
                    });
                    if (hasComposition) {
                        context.restore();
                    }
                    if (hasClip) {
                        context.restore();
                    }
                }
                getClientRect(config) {
                    var _a;
                    config = config || {};
                    var skipTransform = config.skipTransform;
                    var relativeTo = config.relativeTo;
                    var minX, minY, maxX, maxY;
                    var selfRect = {
                        x: Infinity,
                        y: Infinity,
                        width: 0,
                        height: 0,
                    };
                    var that = this;
                    (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function (child) {
                        if (!child.visible()) {
                            return;
                        }
                        var rect = child.getClientRect({
                            relativeTo: that,
                            skipShadow: config.skipShadow,
                            skipStroke: config.skipStroke,
                        });
                        if (rect.width === 0 && rect.height === 0) {
                            return;
                        }
                        if (minX === undefined) {
                            minX = rect.x;
                            minY = rect.y;
                            maxX = rect.x + rect.width;
                            maxY = rect.y + rect.height;
                        }
                        else {
                            minX = Math.min(minX, rect.x);
                            minY = Math.min(minY, rect.y);
                            maxX = Math.max(maxX, rect.x + rect.width);
                            maxY = Math.max(maxY, rect.y + rect.height);
                        }
                    });
                    var shapes = this.find('Shape');
                    var hasVisible = false;
                    for (var i = 0; i < shapes.length; i++) {
                        var shape = shapes[i];
                        if (shape._isVisible(this)) {
                            hasVisible = true;
                            break;
                        }
                    }
                    if (hasVisible && minX !== undefined) {
                        selfRect = {
                            x: minX,
                            y: minY,
                            width: maxX - minX,
                            height: maxY - minY,
                        };
                    }
                    else {
                        selfRect = {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0,
                        };
                    }
                    if (!skipTransform) {
                        return this._transformedRect(selfRect, relativeTo);
                    }
                    return selfRect;
                }
            }
            Factory.addComponentsGetterSetter(Container, 'clip', [
                'x',
                'y',
                'width',
                'height',
            ]);
            Factory.addGetterSetter(Container, 'clipX', undefined, getNumberValidator());
            Factory.addGetterSetter(Container, 'clipY', undefined, getNumberValidator());
            Factory.addGetterSetter(Container, 'clipWidth', undefined, getNumberValidator());
            Factory.addGetterSetter(Container, 'clipHeight', undefined, getNumberValidator());
            Factory.addGetterSetter(Container, 'clipFunc');

            const Captures = new Map();
            const SUPPORT_POINTER_EVENTS = Konva$2._global['PointerEvent'] !== undefined;
            function getCapturedShape(pointerId) {
                return Captures.get(pointerId);
            }
            function createEvent(evt) {
                return {
                    evt,
                    pointerId: evt.pointerId,
                };
            }
            function hasPointerCapture(pointerId, shape) {
                return Captures.get(pointerId) === shape;
            }
            function setPointerCapture(pointerId, shape) {
                releaseCapture(pointerId);
                const stage = shape.getStage();
                if (!stage)
                    return;
                Captures.set(pointerId, shape);
                if (SUPPORT_POINTER_EVENTS) {
                    shape._fire('gotpointercapture', createEvent(new PointerEvent('gotpointercapture')));
                }
            }
            function releaseCapture(pointerId, target) {
                const shape = Captures.get(pointerId);
                if (!shape)
                    return;
                const stage = shape.getStage();
                if (stage && stage.content) ;
                Captures.delete(pointerId);
                if (SUPPORT_POINTER_EVENTS) {
                    shape._fire('lostpointercapture', createEvent(new PointerEvent('lostpointercapture')));
                }
            }

            var STAGE = 'Stage', STRING$1 = 'string', PX = 'px', MOUSEOUT = 'mouseout', MOUSELEAVE = 'mouseleave', MOUSEOVER = 'mouseover', MOUSEENTER = 'mouseenter', MOUSEMOVE = 'mousemove', MOUSEDOWN = 'mousedown', MOUSEUP = 'mouseup', POINTERMOVE = 'pointermove', POINTERDOWN = 'pointerdown', POINTERUP = 'pointerup', POINTERCANCEL = 'pointercancel', LOSTPOINTERCAPTURE = 'lostpointercapture', POINTEROUT = 'pointerout', POINTERLEAVE = 'pointerleave', POINTEROVER = 'pointerover', POINTERENTER = 'pointerenter', CONTEXTMENU = 'contextmenu', TOUCHSTART = 'touchstart', TOUCHEND = 'touchend', TOUCHMOVE = 'touchmove', TOUCHCANCEL = 'touchcancel', WHEEL = 'wheel', MAX_LAYERS_NUMBER = 5, EVENTS = [
                [MOUSEENTER, '_pointerenter'],
                [MOUSEDOWN, '_pointerdown'],
                [MOUSEMOVE, '_pointermove'],
                [MOUSEUP, '_pointerup'],
                [MOUSELEAVE, '_pointerleave'],
                [TOUCHSTART, '_pointerdown'],
                [TOUCHMOVE, '_pointermove'],
                [TOUCHEND, '_pointerup'],
                [TOUCHCANCEL, '_pointercancel'],
                [MOUSEOVER, '_pointerover'],
                [WHEEL, '_wheel'],
                [CONTEXTMENU, '_contextmenu'],
                [POINTERDOWN, '_pointerdown'],
                [POINTERMOVE, '_pointermove'],
                [POINTERUP, '_pointerup'],
                [POINTERCANCEL, '_pointercancel'],
                [LOSTPOINTERCAPTURE, '_lostpointercapture'],
            ];
            const EVENTS_MAP = {
                mouse: {
                    [POINTEROUT]: MOUSEOUT,
                    [POINTERLEAVE]: MOUSELEAVE,
                    [POINTEROVER]: MOUSEOVER,
                    [POINTERENTER]: MOUSEENTER,
                    [POINTERMOVE]: MOUSEMOVE,
                    [POINTERDOWN]: MOUSEDOWN,
                    [POINTERUP]: MOUSEUP,
                    [POINTERCANCEL]: 'mousecancel',
                    pointerclick: 'click',
                    pointerdblclick: 'dblclick',
                },
                touch: {
                    [POINTEROUT]: 'touchout',
                    [POINTERLEAVE]: 'touchleave',
                    [POINTEROVER]: 'touchover',
                    [POINTERENTER]: 'touchenter',
                    [POINTERMOVE]: TOUCHMOVE,
                    [POINTERDOWN]: TOUCHSTART,
                    [POINTERUP]: TOUCHEND,
                    [POINTERCANCEL]: TOUCHCANCEL,
                    pointerclick: 'tap',
                    pointerdblclick: 'dbltap',
                },
                pointer: {
                    [POINTEROUT]: POINTEROUT,
                    [POINTERLEAVE]: POINTERLEAVE,
                    [POINTEROVER]: POINTEROVER,
                    [POINTERENTER]: POINTERENTER,
                    [POINTERMOVE]: POINTERMOVE,
                    [POINTERDOWN]: POINTERDOWN,
                    [POINTERUP]: POINTERUP,
                    [POINTERCANCEL]: POINTERCANCEL,
                    pointerclick: 'pointerclick',
                    pointerdblclick: 'pointerdblclick',
                },
            };
            const getEventType = (type) => {
                if (type.indexOf('pointer') >= 0) {
                    return 'pointer';
                }
                if (type.indexOf('touch') >= 0) {
                    return 'touch';
                }
                return 'mouse';
            };
            const getEventsMap = (eventType) => {
                const type = getEventType(eventType);
                if (type === 'pointer') {
                    return Konva$2.pointerEventsEnabled && EVENTS_MAP.pointer;
                }
                if (type === 'touch') {
                    return EVENTS_MAP.touch;
                }
                if (type === 'mouse') {
                    return EVENTS_MAP.mouse;
                }
            };
            function checkNoClip(attrs = {}) {
                if (attrs.clipFunc || attrs.clipWidth || attrs.clipHeight) {
                    Util.warn('Stage does not support clipping. Please use clip for Layers or Groups.');
                }
                return attrs;
            }
            const NO_POINTERS_MESSAGE = `Pointer position is missing and not registered by the stage. Looks like it is outside of the stage container. You can set it manually from event: stage.setPointersPositions(event);`;
            const stages = [];
            class Stage extends Container {
                constructor(config) {
                    super(checkNoClip(config));
                    this._pointerPositions = [];
                    this._changedPointerPositions = [];
                    this._buildDOM();
                    this._bindContentEvents();
                    stages.push(this);
                    this.on('widthChange.konva heightChange.konva', this._resizeDOM);
                    this.on('visibleChange.konva', this._checkVisibility);
                    this.on('clipWidthChange.konva clipHeightChange.konva clipFuncChange.konva', () => {
                        checkNoClip(this.attrs);
                    });
                    this._checkVisibility();
                }
                _validateAdd(child) {
                    const isLayer = child.getType() === 'Layer';
                    const isFastLayer = child.getType() === 'FastLayer';
                    const valid = isLayer || isFastLayer;
                    if (!valid) {
                        Util.throw('You may only add layers to the stage.');
                    }
                }
                _checkVisibility() {
                    if (!this.content) {
                        return;
                    }
                    const style = this.visible() ? '' : 'none';
                    this.content.style.display = style;
                }
                setContainer(container) {
                    if (typeof container === STRING$1) {
                        if (container.charAt(0) === '.') {
                            var className = container.slice(1);
                            container = document.getElementsByClassName(className)[0];
                        }
                        else {
                            var id;
                            if (container.charAt(0) !== '#') {
                                id = container;
                            }
                            else {
                                id = container.slice(1);
                            }
                            container = document.getElementById(id);
                        }
                        if (!container) {
                            throw 'Can not find container in document with id ' + id;
                        }
                    }
                    this._setAttr('container', container);
                    if (this.content) {
                        if (this.content.parentElement) {
                            this.content.parentElement.removeChild(this.content);
                        }
                        container.appendChild(this.content);
                    }
                    return this;
                }
                shouldDrawHit() {
                    return true;
                }
                clear() {
                    var layers = this.children, len = layers.length, n;
                    for (n = 0; n < len; n++) {
                        layers[n].clear();
                    }
                    return this;
                }
                clone(obj) {
                    if (!obj) {
                        obj = {};
                    }
                    obj.container =
                        typeof document !== 'undefined' && document.createElement('div');
                    return Container.prototype.clone.call(this, obj);
                }
                destroy() {
                    super.destroy();
                    var content = this.content;
                    if (content && Util._isInDocument(content)) {
                        this.container().removeChild(content);
                    }
                    var index = stages.indexOf(this);
                    if (index > -1) {
                        stages.splice(index, 1);
                    }
                    Util.releaseCanvas(this.bufferCanvas._canvas, this.bufferHitCanvas._canvas);
                    return this;
                }
                getPointerPosition() {
                    const pos = this._pointerPositions[0] || this._changedPointerPositions[0];
                    if (!pos) {
                        Util.warn(NO_POINTERS_MESSAGE);
                        return null;
                    }
                    return {
                        x: pos.x,
                        y: pos.y,
                    };
                }
                _getPointerById(id) {
                    return this._pointerPositions.find((p) => p.id === id);
                }
                getPointersPositions() {
                    return this._pointerPositions;
                }
                getStage() {
                    return this;
                }
                getContent() {
                    return this.content;
                }
                _toKonvaCanvas(config) {
                    config = config || {};
                    config.x = config.x || 0;
                    config.y = config.y || 0;
                    config.width = config.width || this.width();
                    config.height = config.height || this.height();
                    var canvas = new SceneCanvas({
                        width: config.width,
                        height: config.height,
                        pixelRatio: config.pixelRatio || 1,
                    });
                    var _context = canvas.getContext()._context;
                    var layers = this.children;
                    if (config.x || config.y) {
                        _context.translate(-1 * config.x, -1 * config.y);
                    }
                    layers.forEach(function (layer) {
                        if (!layer.isVisible()) {
                            return;
                        }
                        var layerCanvas = layer._toKonvaCanvas(config);
                        _context.drawImage(layerCanvas._canvas, config.x, config.y, layerCanvas.getWidth() / layerCanvas.getPixelRatio(), layerCanvas.getHeight() / layerCanvas.getPixelRatio());
                    });
                    return canvas;
                }
                getIntersection(pos) {
                    if (!pos) {
                        return null;
                    }
                    var layers = this.children, len = layers.length, end = len - 1, n;
                    for (n = end; n >= 0; n--) {
                        const shape = layers[n].getIntersection(pos);
                        if (shape) {
                            return shape;
                        }
                    }
                    return null;
                }
                _resizeDOM() {
                    var width = this.width();
                    var height = this.height();
                    if (this.content) {
                        this.content.style.width = width + PX;
                        this.content.style.height = height + PX;
                    }
                    this.bufferCanvas.setSize(width, height);
                    this.bufferHitCanvas.setSize(width, height);
                    this.children.forEach((layer) => {
                        layer.setSize({ width, height });
                        layer.draw();
                    });
                }
                add(layer, ...rest) {
                    if (arguments.length > 1) {
                        for (var i = 0; i < arguments.length; i++) {
                            this.add(arguments[i]);
                        }
                        return this;
                    }
                    super.add(layer);
                    var length = this.children.length;
                    if (length > MAX_LAYERS_NUMBER) {
                        Util.warn('The stage has ' +
                            length +
                            ' layers. Recommended maximum number of layers is 3-5. Adding more layers into the stage may drop the performance. Rethink your tree structure, you can use Konva.Group.');
                    }
                    layer.setSize({ width: this.width(), height: this.height() });
                    layer.draw();
                    if (Konva$2.isBrowser) {
                        this.content.appendChild(layer.canvas._canvas);
                    }
                    return this;
                }
                getParent() {
                    return null;
                }
                getLayer() {
                    return null;
                }
                hasPointerCapture(pointerId) {
                    return hasPointerCapture(pointerId, this);
                }
                setPointerCapture(pointerId) {
                    setPointerCapture(pointerId, this);
                }
                releaseCapture(pointerId) {
                    releaseCapture(pointerId);
                }
                getLayers() {
                    return this.children;
                }
                _bindContentEvents() {
                    if (!Konva$2.isBrowser) {
                        return;
                    }
                    EVENTS.forEach(([event, methodName]) => {
                        this.content.addEventListener(event, (evt) => {
                            this[methodName](evt);
                        }, { passive: false });
                    });
                }
                _pointerenter(evt) {
                    this.setPointersPositions(evt);
                    const events = getEventsMap(evt.type);
                    this._fire(events.pointerenter, {
                        evt: evt,
                        target: this,
                        currentTarget: this,
                    });
                }
                _pointerover(evt) {
                    this.setPointersPositions(evt);
                    const events = getEventsMap(evt.type);
                    this._fire(events.pointerover, {
                        evt: evt,
                        target: this,
                        currentTarget: this,
                    });
                }
                _getTargetShape(evenType) {
                    let shape = this[evenType + 'targetShape'];
                    if (shape && !shape.getStage()) {
                        shape = null;
                    }
                    return shape;
                }
                _pointerleave(evt) {
                    const events = getEventsMap(evt.type);
                    const eventType = getEventType(evt.type);
                    if (!events) {
                        return;
                    }
                    this.setPointersPositions(evt);
                    var targetShape = this._getTargetShape(eventType);
                    var eventsEnabled = !DD.isDragging || Konva$2.hitOnDragEnabled;
                    if (targetShape && eventsEnabled) {
                        targetShape._fireAndBubble(events.pointerout, { evt: evt });
                        targetShape._fireAndBubble(events.pointerleave, { evt: evt });
                        this._fire(events.pointerleave, {
                            evt: evt,
                            target: this,
                            currentTarget: this,
                        });
                        this[eventType + 'targetShape'] = null;
                    }
                    else if (eventsEnabled) {
                        this._fire(events.pointerleave, {
                            evt: evt,
                            target: this,
                            currentTarget: this,
                        });
                        this._fire(events.pointerout, {
                            evt: evt,
                            target: this,
                            currentTarget: this,
                        });
                    }
                    this.pointerPos = undefined;
                    this._pointerPositions = [];
                }
                _pointerdown(evt) {
                    const events = getEventsMap(evt.type);
                    const eventType = getEventType(evt.type);
                    if (!events) {
                        return;
                    }
                    this.setPointersPositions(evt);
                    var triggeredOnShape = false;
                    this._changedPointerPositions.forEach((pos) => {
                        var shape = this.getIntersection(pos);
                        DD.justDragged = false;
                        Konva$2['_' + eventType + 'ListenClick'] = true;
                        const hasShape = shape && shape.isListening();
                        if (!hasShape) {
                            return;
                        }
                        if (Konva$2.capturePointerEventsEnabled) {
                            shape.setPointerCapture(pos.id);
                        }
                        this[eventType + 'ClickStartShape'] = shape;
                        shape._fireAndBubble(events.pointerdown, {
                            evt: evt,
                            pointerId: pos.id,
                        });
                        triggeredOnShape = true;
                        const isTouch = evt.type.indexOf('touch') >= 0;
                        if (shape.preventDefault() && evt.cancelable && isTouch) {
                            evt.preventDefault();
                        }
                    });
                    if (!triggeredOnShape) {
                        this._fire(events.pointerdown, {
                            evt: evt,
                            target: this,
                            currentTarget: this,
                            pointerId: this._pointerPositions[0].id,
                        });
                    }
                }
                _pointermove(evt) {
                    const events = getEventsMap(evt.type);
                    const eventType = getEventType(evt.type);
                    if (!events) {
                        return;
                    }
                    if (DD.isDragging && DD.node.preventDefault() && evt.cancelable) {
                        evt.preventDefault();
                    }
                    this.setPointersPositions(evt);
                    var eventsEnabled = !DD.isDragging || Konva$2.hitOnDragEnabled;
                    if (!eventsEnabled) {
                        return;
                    }
                    var processedShapesIds = {};
                    let triggeredOnShape = false;
                    var targetShape = this._getTargetShape(eventType);
                    this._changedPointerPositions.forEach((pos) => {
                        const shape = (getCapturedShape(pos.id) ||
                            this.getIntersection(pos));
                        const pointerId = pos.id;
                        const event = { evt: evt, pointerId };
                        var differentTarget = targetShape !== shape;
                        if (differentTarget && targetShape) {
                            targetShape._fireAndBubble(events.pointerout, Object.assign({}, event), shape);
                            targetShape._fireAndBubble(events.pointerleave, Object.assign({}, event), shape);
                        }
                        if (shape) {
                            if (processedShapesIds[shape._id]) {
                                return;
                            }
                            processedShapesIds[shape._id] = true;
                        }
                        if (shape && shape.isListening()) {
                            triggeredOnShape = true;
                            if (differentTarget) {
                                shape._fireAndBubble(events.pointerover, Object.assign({}, event), targetShape);
                                shape._fireAndBubble(events.pointerenter, Object.assign({}, event), targetShape);
                                this[eventType + 'targetShape'] = shape;
                            }
                            shape._fireAndBubble(events.pointermove, Object.assign({}, event));
                        }
                        else {
                            if (targetShape) {
                                this._fire(events.pointerover, {
                                    evt: evt,
                                    target: this,
                                    currentTarget: this,
                                    pointerId,
                                });
                                this[eventType + 'targetShape'] = null;
                            }
                        }
                    });
                    if (!triggeredOnShape) {
                        this._fire(events.pointermove, {
                            evt: evt,
                            target: this,
                            currentTarget: this,
                            pointerId: this._changedPointerPositions[0].id,
                        });
                    }
                }
                _pointerup(evt) {
                    const events = getEventsMap(evt.type);
                    const eventType = getEventType(evt.type);
                    if (!events) {
                        return;
                    }
                    this.setPointersPositions(evt);
                    const clickStartShape = this[eventType + 'ClickStartShape'];
                    const clickEndShape = this[eventType + 'ClickEndShape'];
                    var processedShapesIds = {};
                    let triggeredOnShape = false;
                    this._changedPointerPositions.forEach((pos) => {
                        const shape = (getCapturedShape(pos.id) ||
                            this.getIntersection(pos));
                        if (shape) {
                            shape.releaseCapture(pos.id);
                            if (processedShapesIds[shape._id]) {
                                return;
                            }
                            processedShapesIds[shape._id] = true;
                        }
                        const pointerId = pos.id;
                        const event = { evt: evt, pointerId };
                        let fireDblClick = false;
                        if (Konva$2['_' + eventType + 'InDblClickWindow']) {
                            fireDblClick = true;
                            clearTimeout(this[eventType + 'DblTimeout']);
                        }
                        else if (!DD.justDragged) {
                            Konva$2['_' + eventType + 'InDblClickWindow'] = true;
                            clearTimeout(this[eventType + 'DblTimeout']);
                        }
                        this[eventType + 'DblTimeout'] = setTimeout(function () {
                            Konva$2['_' + eventType + 'InDblClickWindow'] = false;
                        }, Konva$2.dblClickWindow);
                        if (shape && shape.isListening()) {
                            triggeredOnShape = true;
                            this[eventType + 'ClickEndShape'] = shape;
                            shape._fireAndBubble(events.pointerup, Object.assign({}, event));
                            if (Konva$2['_' + eventType + 'ListenClick'] &&
                                clickStartShape &&
                                clickStartShape === shape) {
                                shape._fireAndBubble(events.pointerclick, Object.assign({}, event));
                                if (fireDblClick && clickEndShape && clickEndShape === shape) {
                                    shape._fireAndBubble(events.pointerdblclick, Object.assign({}, event));
                                }
                            }
                        }
                        else {
                            this[eventType + 'ClickEndShape'] = null;
                            if (Konva$2['_' + eventType + 'ListenClick']) {
                                this._fire(events.pointerclick, {
                                    evt: evt,
                                    target: this,
                                    currentTarget: this,
                                    pointerId,
                                });
                            }
                            if (fireDblClick) {
                                this._fire(events.pointerdblclick, {
                                    evt: evt,
                                    target: this,
                                    currentTarget: this,
                                    pointerId,
                                });
                            }
                        }
                    });
                    if (!triggeredOnShape) {
                        this._fire(events.pointerup, {
                            evt: evt,
                            target: this,
                            currentTarget: this,
                            pointerId: this._changedPointerPositions[0].id,
                        });
                    }
                    Konva$2['_' + eventType + 'ListenClick'] = false;
                    if (evt.cancelable && eventType !== 'touch') {
                        evt.preventDefault();
                    }
                }
                _contextmenu(evt) {
                    this.setPointersPositions(evt);
                    var shape = this.getIntersection(this.getPointerPosition());
                    if (shape && shape.isListening()) {
                        shape._fireAndBubble(CONTEXTMENU, { evt: evt });
                    }
                    else {
                        this._fire(CONTEXTMENU, {
                            evt: evt,
                            target: this,
                            currentTarget: this,
                        });
                    }
                }
                _wheel(evt) {
                    this.setPointersPositions(evt);
                    var shape = this.getIntersection(this.getPointerPosition());
                    if (shape && shape.isListening()) {
                        shape._fireAndBubble(WHEEL, { evt: evt });
                    }
                    else {
                        this._fire(WHEEL, {
                            evt: evt,
                            target: this,
                            currentTarget: this,
                        });
                    }
                }
                _pointercancel(evt) {
                    this.setPointersPositions(evt);
                    const shape = getCapturedShape(evt.pointerId) ||
                        this.getIntersection(this.getPointerPosition());
                    if (shape) {
                        shape._fireAndBubble(POINTERUP, createEvent(evt));
                    }
                    releaseCapture(evt.pointerId);
                }
                _lostpointercapture(evt) {
                    releaseCapture(evt.pointerId);
                }
                setPointersPositions(evt) {
                    var contentPosition = this._getContentPosition(), x = null, y = null;
                    evt = evt ? evt : window.event;
                    if (evt.touches !== undefined) {
                        this._pointerPositions = [];
                        this._changedPointerPositions = [];
                        Array.prototype.forEach.call(evt.touches, (touch) => {
                            this._pointerPositions.push({
                                id: touch.identifier,
                                x: (touch.clientX - contentPosition.left) / contentPosition.scaleX,
                                y: (touch.clientY - contentPosition.top) / contentPosition.scaleY,
                            });
                        });
                        Array.prototype.forEach.call(evt.changedTouches || evt.touches, (touch) => {
                            this._changedPointerPositions.push({
                                id: touch.identifier,
                                x: (touch.clientX - contentPosition.left) / contentPosition.scaleX,
                                y: (touch.clientY - contentPosition.top) / contentPosition.scaleY,
                            });
                        });
                    }
                    else {
                        x = (evt.clientX - contentPosition.left) / contentPosition.scaleX;
                        y = (evt.clientY - contentPosition.top) / contentPosition.scaleY;
                        this.pointerPos = {
                            x: x,
                            y: y,
                        };
                        this._pointerPositions = [{ x, y, id: Util._getFirstPointerId(evt) }];
                        this._changedPointerPositions = [
                            { x, y, id: Util._getFirstPointerId(evt) },
                        ];
                    }
                }
                _setPointerPosition(evt) {
                    Util.warn('Method _setPointerPosition is deprecated. Use "stage.setPointersPositions(event)" instead.');
                    this.setPointersPositions(evt);
                }
                _getContentPosition() {
                    if (!this.content || !this.content.getBoundingClientRect) {
                        return {
                            top: 0,
                            left: 0,
                            scaleX: 1,
                            scaleY: 1,
                        };
                    }
                    var rect = this.content.getBoundingClientRect();
                    return {
                        top: rect.top,
                        left: rect.left,
                        scaleX: rect.width / this.content.clientWidth || 1,
                        scaleY: rect.height / this.content.clientHeight || 1,
                    };
                }
                _buildDOM() {
                    this.bufferCanvas = new SceneCanvas({
                        width: this.width(),
                        height: this.height(),
                    });
                    this.bufferHitCanvas = new HitCanvas({
                        pixelRatio: 1,
                        width: this.width(),
                        height: this.height(),
                    });
                    if (!Konva$2.isBrowser) {
                        return;
                    }
                    var container = this.container();
                    if (!container) {
                        throw 'Stage has no container. A container is required.';
                    }
                    container.innerHTML = '';
                    this.content = document.createElement('div');
                    this.content.style.position = 'relative';
                    this.content.style.userSelect = 'none';
                    this.content.className = 'konvajs-content';
                    this.content.setAttribute('role', 'presentation');
                    container.appendChild(this.content);
                    this._resizeDOM();
                }
                cache() {
                    Util.warn('Cache function is not allowed for stage. You may use cache only for layers, groups and shapes.');
                    return this;
                }
                clearCache() {
                    return this;
                }
                batchDraw() {
                    this.getChildren().forEach(function (layer) {
                        layer.batchDraw();
                    });
                    return this;
                }
            }
            Stage.prototype.nodeType = STAGE;
            _registerNode(Stage);
            Factory.addGetterSetter(Stage, 'container');

            var HAS_SHADOW = 'hasShadow';
            var SHADOW_RGBA = 'shadowRGBA';
            var patternImage = 'patternImage';
            var linearGradient = 'linearGradient';
            var radialGradient = 'radialGradient';
            let dummyContext$1;
            function getDummyContext$1() {
                if (dummyContext$1) {
                    return dummyContext$1;
                }
                dummyContext$1 = Util.createCanvasElement().getContext('2d');
                return dummyContext$1;
            }
            const shapes = {};
            function _fillFunc$2(context) {
                context.fill();
            }
            function _strokeFunc$2(context) {
                context.stroke();
            }
            function _fillFuncHit(context) {
                context.fill();
            }
            function _strokeFuncHit(context) {
                context.stroke();
            }
            function _clearHasShadowCache() {
                this._clearCache(HAS_SHADOW);
            }
            function _clearGetShadowRGBACache() {
                this._clearCache(SHADOW_RGBA);
            }
            function _clearFillPatternCache() {
                this._clearCache(patternImage);
            }
            function _clearLinearGradientCache() {
                this._clearCache(linearGradient);
            }
            function _clearRadialGradientCache() {
                this._clearCache(radialGradient);
            }
            class Shape extends Node {
                constructor(config) {
                    super(config);
                    let key;
                    while (true) {
                        key = Util.getRandomColor();
                        if (key && !(key in shapes)) {
                            break;
                        }
                    }
                    this.colorKey = key;
                    shapes[key] = this;
                }
                getContext() {
                    Util.warn('shape.getContext() method is deprecated. Please do not use it.');
                    return this.getLayer().getContext();
                }
                getCanvas() {
                    Util.warn('shape.getCanvas() method is deprecated. Please do not use it.');
                    return this.getLayer().getCanvas();
                }
                getSceneFunc() {
                    return this.attrs.sceneFunc || this['_sceneFunc'];
                }
                getHitFunc() {
                    return this.attrs.hitFunc || this['_hitFunc'];
                }
                hasShadow() {
                    return this._getCache(HAS_SHADOW, this._hasShadow);
                }
                _hasShadow() {
                    return (this.shadowEnabled() &&
                        this.shadowOpacity() !== 0 &&
                        !!(this.shadowColor() ||
                            this.shadowBlur() ||
                            this.shadowOffsetX() ||
                            this.shadowOffsetY()));
                }
                _getFillPattern() {
                    return this._getCache(patternImage, this.__getFillPattern);
                }
                __getFillPattern() {
                    if (this.fillPatternImage()) {
                        var ctx = getDummyContext$1();
                        const pattern = ctx.createPattern(this.fillPatternImage(), this.fillPatternRepeat() || 'repeat');
                        if (pattern && pattern.setTransform) {
                            const tr = new Transform();
                            tr.translate(this.fillPatternX(), this.fillPatternY());
                            tr.rotate(Konva$2.getAngle(this.fillPatternRotation()));
                            tr.scale(this.fillPatternScaleX(), this.fillPatternScaleY());
                            tr.translate(-1 * this.fillPatternOffsetX(), -1 * this.fillPatternOffsetY());
                            const m = tr.getMatrix();
                            const matrix = typeof DOMMatrix === 'undefined'
                                ? {
                                    a: m[0],
                                    b: m[1],
                                    c: m[2],
                                    d: m[3],
                                    e: m[4],
                                    f: m[5],
                                }
                                : new DOMMatrix(m);
                            pattern.setTransform(matrix);
                        }
                        return pattern;
                    }
                }
                _getLinearGradient() {
                    return this._getCache(linearGradient, this.__getLinearGradient);
                }
                __getLinearGradient() {
                    var colorStops = this.fillLinearGradientColorStops();
                    if (colorStops) {
                        var ctx = getDummyContext$1();
                        var start = this.fillLinearGradientStartPoint();
                        var end = this.fillLinearGradientEndPoint();
                        var grd = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
                        for (var n = 0; n < colorStops.length; n += 2) {
                            grd.addColorStop(colorStops[n], colorStops[n + 1]);
                        }
                        return grd;
                    }
                }
                _getRadialGradient() {
                    return this._getCache(radialGradient, this.__getRadialGradient);
                }
                __getRadialGradient() {
                    var colorStops = this.fillRadialGradientColorStops();
                    if (colorStops) {
                        var ctx = getDummyContext$1();
                        var start = this.fillRadialGradientStartPoint();
                        var end = this.fillRadialGradientEndPoint();
                        var grd = ctx.createRadialGradient(start.x, start.y, this.fillRadialGradientStartRadius(), end.x, end.y, this.fillRadialGradientEndRadius());
                        for (var n = 0; n < colorStops.length; n += 2) {
                            grd.addColorStop(colorStops[n], colorStops[n + 1]);
                        }
                        return grd;
                    }
                }
                getShadowRGBA() {
                    return this._getCache(SHADOW_RGBA, this._getShadowRGBA);
                }
                _getShadowRGBA() {
                    if (!this.hasShadow()) {
                        return;
                    }
                    var rgba = Util.colorToRGBA(this.shadowColor());
                    if (rgba) {
                        return ('rgba(' +
                            rgba.r +
                            ',' +
                            rgba.g +
                            ',' +
                            rgba.b +
                            ',' +
                            rgba.a * (this.shadowOpacity() || 1) +
                            ')');
                    }
                }
                hasFill() {
                    return this._calculate('hasFill', [
                        'fillEnabled',
                        'fill',
                        'fillPatternImage',
                        'fillLinearGradientColorStops',
                        'fillRadialGradientColorStops',
                    ], () => {
                        return (this.fillEnabled() &&
                            !!(this.fill() ||
                                this.fillPatternImage() ||
                                this.fillLinearGradientColorStops() ||
                                this.fillRadialGradientColorStops()));
                    });
                }
                hasStroke() {
                    return this._calculate('hasStroke', [
                        'strokeEnabled',
                        'strokeWidth',
                        'stroke',
                        'strokeLinearGradientColorStops',
                    ], () => {
                        return (this.strokeEnabled() &&
                            this.strokeWidth() &&
                            !!(this.stroke() || this.strokeLinearGradientColorStops()));
                    });
                }
                hasHitStroke() {
                    const width = this.hitStrokeWidth();
                    if (width === 'auto') {
                        return this.hasStroke();
                    }
                    return this.strokeEnabled() && !!width;
                }
                intersects(point) {
                    var stage = this.getStage(), bufferHitCanvas = stage.bufferHitCanvas, p;
                    bufferHitCanvas.getContext().clear();
                    this.drawHit(bufferHitCanvas, null, true);
                    p = bufferHitCanvas.context.getImageData(Math.round(point.x), Math.round(point.y), 1, 1).data;
                    return p[3] > 0;
                }
                destroy() {
                    Node.prototype.destroy.call(this);
                    delete shapes[this.colorKey];
                    delete this.colorKey;
                    return this;
                }
                _useBufferCanvas(forceFill) {
                    var _a;
                    if (!this.getStage()) {
                        return false;
                    }
                    const perfectDrawEnabled = (_a = this.attrs.perfectDrawEnabled) !== null && _a !== void 0 ? _a : true;
                    if (!perfectDrawEnabled) {
                        return false;
                    }
                    const hasFill = forceFill || this.hasFill();
                    const hasStroke = this.hasStroke();
                    const isTransparent = this.getAbsoluteOpacity() !== 1;
                    if (hasFill && hasStroke && isTransparent) {
                        return true;
                    }
                    const hasShadow = this.hasShadow();
                    const strokeForShadow = this.shadowForStrokeEnabled();
                    if (hasFill && hasStroke && hasShadow && strokeForShadow) {
                        return true;
                    }
                    return false;
                }
                setStrokeHitEnabled(val) {
                    Util.warn('strokeHitEnabled property is deprecated. Please use hitStrokeWidth instead.');
                    if (val) {
                        this.hitStrokeWidth('auto');
                    }
                    else {
                        this.hitStrokeWidth(0);
                    }
                }
                getStrokeHitEnabled() {
                    if (this.hitStrokeWidth() === 0) {
                        return false;
                    }
                    else {
                        return true;
                    }
                }
                getSelfRect() {
                    var size = this.size();
                    return {
                        x: this._centroid ? -size.width / 2 : 0,
                        y: this._centroid ? -size.height / 2 : 0,
                        width: size.width,
                        height: size.height,
                    };
                }
                getClientRect(config = {}) {
                    const skipTransform = config.skipTransform;
                    const relativeTo = config.relativeTo;
                    const fillRect = this.getSelfRect();
                    const applyStroke = !config.skipStroke && this.hasStroke();
                    const strokeWidth = (applyStroke && this.strokeWidth()) || 0;
                    const fillAndStrokeWidth = fillRect.width + strokeWidth;
                    const fillAndStrokeHeight = fillRect.height + strokeWidth;
                    const applyShadow = !config.skipShadow && this.hasShadow();
                    const shadowOffsetX = applyShadow ? this.shadowOffsetX() : 0;
                    const shadowOffsetY = applyShadow ? this.shadowOffsetY() : 0;
                    const preWidth = fillAndStrokeWidth + Math.abs(shadowOffsetX);
                    const preHeight = fillAndStrokeHeight + Math.abs(shadowOffsetY);
                    const blurRadius = (applyShadow && this.shadowBlur()) || 0;
                    const width = preWidth + blurRadius * 2;
                    const height = preHeight + blurRadius * 2;
                    const rect = {
                        width: width,
                        height: height,
                        x: -(strokeWidth / 2 + blurRadius) +
                            Math.min(shadowOffsetX, 0) +
                            fillRect.x,
                        y: -(strokeWidth / 2 + blurRadius) +
                            Math.min(shadowOffsetY, 0) +
                            fillRect.y,
                    };
                    if (!skipTransform) {
                        return this._transformedRect(rect, relativeTo);
                    }
                    return rect;
                }
                drawScene(can, top) {
                    var layer = this.getLayer(), canvas = can || layer.getCanvas(), context = canvas.getContext(), cachedCanvas = this._getCanvasCache(), drawFunc = this.getSceneFunc(), hasShadow = this.hasShadow(), stage, bufferCanvas, bufferContext;
                    var skipBuffer = canvas.isCache;
                    var cachingSelf = top === this;
                    if (!this.isVisible() && !cachingSelf) {
                        return this;
                    }
                    if (cachedCanvas) {
                        context.save();
                        var m = this.getAbsoluteTransform(top).getMatrix();
                        context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                        this._drawCachedSceneCanvas(context);
                        context.restore();
                        return this;
                    }
                    if (!drawFunc) {
                        return this;
                    }
                    context.save();
                    if (this._useBufferCanvas() && !skipBuffer) {
                        stage = this.getStage();
                        bufferCanvas = stage.bufferCanvas;
                        bufferContext = bufferCanvas.getContext();
                        bufferContext.clear();
                        bufferContext.save();
                        bufferContext._applyLineJoin(this);
                        var o = this.getAbsoluteTransform(top).getMatrix();
                        bufferContext.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
                        drawFunc.call(this, bufferContext, this);
                        bufferContext.restore();
                        var ratio = bufferCanvas.pixelRatio;
                        if (hasShadow) {
                            context._applyShadow(this);
                        }
                        context._applyOpacity(this);
                        context._applyGlobalCompositeOperation(this);
                        context.drawImage(bufferCanvas._canvas, 0, 0, bufferCanvas.width / ratio, bufferCanvas.height / ratio);
                    }
                    else {
                        context._applyLineJoin(this);
                        if (!cachingSelf) {
                            var o = this.getAbsoluteTransform(top).getMatrix();
                            context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
                            context._applyOpacity(this);
                            context._applyGlobalCompositeOperation(this);
                        }
                        if (hasShadow) {
                            context._applyShadow(this);
                        }
                        drawFunc.call(this, context, this);
                    }
                    context.restore();
                    return this;
                }
                drawHit(can, top, skipDragCheck = false) {
                    if (!this.shouldDrawHit(top, skipDragCheck)) {
                        return this;
                    }
                    var layer = this.getLayer(), canvas = can || layer.hitCanvas, context = canvas && canvas.getContext(), drawFunc = this.hitFunc() || this.sceneFunc(), cachedCanvas = this._getCanvasCache(), cachedHitCanvas = cachedCanvas && cachedCanvas.hit;
                    if (!this.colorKey) {
                        Util.warn('Looks like your canvas has a destroyed shape in it. Do not reuse shape after you destroyed it. If you want to reuse shape you should call remove() instead of destroy()');
                    }
                    if (cachedHitCanvas) {
                        context.save();
                        var m = this.getAbsoluteTransform(top).getMatrix();
                        context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                        this._drawCachedHitCanvas(context);
                        context.restore();
                        return this;
                    }
                    if (!drawFunc) {
                        return this;
                    }
                    context.save();
                    context._applyLineJoin(this);
                    const selfCache = this === top;
                    if (!selfCache) {
                        var o = this.getAbsoluteTransform(top).getMatrix();
                        context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
                    }
                    drawFunc.call(this, context, this);
                    context.restore();
                    return this;
                }
                drawHitFromCache(alphaThreshold = 0) {
                    var cachedCanvas = this._getCanvasCache(), sceneCanvas = this._getCachedSceneCanvas(), hitCanvas = cachedCanvas.hit, hitContext = hitCanvas.getContext(), hitWidth = hitCanvas.getWidth(), hitHeight = hitCanvas.getHeight(), hitImageData, hitData, len, rgbColorKey, i, alpha;
                    hitContext.clear();
                    hitContext.drawImage(sceneCanvas._canvas, 0, 0, hitWidth, hitHeight);
                    try {
                        hitImageData = hitContext.getImageData(0, 0, hitWidth, hitHeight);
                        hitData = hitImageData.data;
                        len = hitData.length;
                        rgbColorKey = Util._hexToRgb(this.colorKey);
                        for (i = 0; i < len; i += 4) {
                            alpha = hitData[i + 3];
                            if (alpha > alphaThreshold) {
                                hitData[i] = rgbColorKey.r;
                                hitData[i + 1] = rgbColorKey.g;
                                hitData[i + 2] = rgbColorKey.b;
                                hitData[i + 3] = 255;
                            }
                            else {
                                hitData[i + 3] = 0;
                            }
                        }
                        hitContext.putImageData(hitImageData, 0, 0);
                    }
                    catch (e) {
                        Util.error('Unable to draw hit graph from cached scene canvas. ' + e.message);
                    }
                    return this;
                }
                hasPointerCapture(pointerId) {
                    return hasPointerCapture(pointerId, this);
                }
                setPointerCapture(pointerId) {
                    setPointerCapture(pointerId, this);
                }
                releaseCapture(pointerId) {
                    releaseCapture(pointerId);
                }
            }
            Shape.prototype._fillFunc = _fillFunc$2;
            Shape.prototype._strokeFunc = _strokeFunc$2;
            Shape.prototype._fillFuncHit = _fillFuncHit;
            Shape.prototype._strokeFuncHit = _strokeFuncHit;
            Shape.prototype._centroid = false;
            Shape.prototype.nodeType = 'Shape';
            _registerNode(Shape);
            Shape.prototype.eventListeners = {};
            Shape.prototype.on.call(Shape.prototype, 'shadowColorChange.konva shadowBlurChange.konva shadowOffsetChange.konva shadowOpacityChange.konva shadowEnabledChange.konva', _clearHasShadowCache);
            Shape.prototype.on.call(Shape.prototype, 'shadowColorChange.konva shadowOpacityChange.konva shadowEnabledChange.konva', _clearGetShadowRGBACache);
            Shape.prototype.on.call(Shape.prototype, 'fillPriorityChange.konva fillPatternImageChange.konva fillPatternRepeatChange.konva fillPatternScaleXChange.konva fillPatternScaleYChange.konva fillPatternOffsetXChange.konva fillPatternOffsetYChange.konva fillPatternXChange.konva fillPatternYChange.konva fillPatternRotationChange.konva', _clearFillPatternCache);
            Shape.prototype.on.call(Shape.prototype, 'fillPriorityChange.konva fillLinearGradientColorStopsChange.konva fillLinearGradientStartPointXChange.konva fillLinearGradientStartPointYChange.konva fillLinearGradientEndPointXChange.konva fillLinearGradientEndPointYChange.konva', _clearLinearGradientCache);
            Shape.prototype.on.call(Shape.prototype, 'fillPriorityChange.konva fillRadialGradientColorStopsChange.konva fillRadialGradientStartPointXChange.konva fillRadialGradientStartPointYChange.konva fillRadialGradientEndPointXChange.konva fillRadialGradientEndPointYChange.konva fillRadialGradientStartRadiusChange.konva fillRadialGradientEndRadiusChange.konva', _clearRadialGradientCache);
            Factory.addGetterSetter(Shape, 'stroke', undefined, getStringOrGradientValidator());
            Factory.addGetterSetter(Shape, 'strokeWidth', 2, getNumberValidator());
            Factory.addGetterSetter(Shape, 'fillAfterStrokeEnabled', false);
            Factory.addGetterSetter(Shape, 'hitStrokeWidth', 'auto', getNumberOrAutoValidator());
            Factory.addGetterSetter(Shape, 'strokeHitEnabled', true, getBooleanValidator());
            Factory.addGetterSetter(Shape, 'perfectDrawEnabled', true, getBooleanValidator());
            Factory.addGetterSetter(Shape, 'shadowForStrokeEnabled', true, getBooleanValidator());
            Factory.addGetterSetter(Shape, 'lineJoin');
            Factory.addGetterSetter(Shape, 'lineCap');
            Factory.addGetterSetter(Shape, 'sceneFunc');
            Factory.addGetterSetter(Shape, 'hitFunc');
            Factory.addGetterSetter(Shape, 'dash');
            Factory.addGetterSetter(Shape, 'dashOffset', 0, getNumberValidator());
            Factory.addGetterSetter(Shape, 'shadowColor', undefined, getStringValidator());
            Factory.addGetterSetter(Shape, 'shadowBlur', 0, getNumberValidator());
            Factory.addGetterSetter(Shape, 'shadowOpacity', 1, getNumberValidator());
            Factory.addComponentsGetterSetter(Shape, 'shadowOffset', ['x', 'y']);
            Factory.addGetterSetter(Shape, 'shadowOffsetX', 0, getNumberValidator());
            Factory.addGetterSetter(Shape, 'shadowOffsetY', 0, getNumberValidator());
            Factory.addGetterSetter(Shape, 'fillPatternImage');
            Factory.addGetterSetter(Shape, 'fill', undefined, getStringOrGradientValidator());
            Factory.addGetterSetter(Shape, 'fillPatternX', 0, getNumberValidator());
            Factory.addGetterSetter(Shape, 'fillPatternY', 0, getNumberValidator());
            Factory.addGetterSetter(Shape, 'fillLinearGradientColorStops');
            Factory.addGetterSetter(Shape, 'strokeLinearGradientColorStops');
            Factory.addGetterSetter(Shape, 'fillRadialGradientStartRadius', 0);
            Factory.addGetterSetter(Shape, 'fillRadialGradientEndRadius', 0);
            Factory.addGetterSetter(Shape, 'fillRadialGradientColorStops');
            Factory.addGetterSetter(Shape, 'fillPatternRepeat', 'repeat');
            Factory.addGetterSetter(Shape, 'fillEnabled', true);
            Factory.addGetterSetter(Shape, 'strokeEnabled', true);
            Factory.addGetterSetter(Shape, 'shadowEnabled', true);
            Factory.addGetterSetter(Shape, 'dashEnabled', true);
            Factory.addGetterSetter(Shape, 'strokeScaleEnabled', true);
            Factory.addGetterSetter(Shape, 'fillPriority', 'color');
            Factory.addComponentsGetterSetter(Shape, 'fillPatternOffset', ['x', 'y']);
            Factory.addGetterSetter(Shape, 'fillPatternOffsetX', 0, getNumberValidator());
            Factory.addGetterSetter(Shape, 'fillPatternOffsetY', 0, getNumberValidator());
            Factory.addComponentsGetterSetter(Shape, 'fillPatternScale', ['x', 'y']);
            Factory.addGetterSetter(Shape, 'fillPatternScaleX', 1, getNumberValidator());
            Factory.addGetterSetter(Shape, 'fillPatternScaleY', 1, getNumberValidator());
            Factory.addComponentsGetterSetter(Shape, 'fillLinearGradientStartPoint', [
                'x',
                'y',
            ]);
            Factory.addComponentsGetterSetter(Shape, 'strokeLinearGradientStartPoint', [
                'x',
                'y',
            ]);
            Factory.addGetterSetter(Shape, 'fillLinearGradientStartPointX', 0);
            Factory.addGetterSetter(Shape, 'strokeLinearGradientStartPointX', 0);
            Factory.addGetterSetter(Shape, 'fillLinearGradientStartPointY', 0);
            Factory.addGetterSetter(Shape, 'strokeLinearGradientStartPointY', 0);
            Factory.addComponentsGetterSetter(Shape, 'fillLinearGradientEndPoint', [
                'x',
                'y',
            ]);
            Factory.addComponentsGetterSetter(Shape, 'strokeLinearGradientEndPoint', [
                'x',
                'y',
            ]);
            Factory.addGetterSetter(Shape, 'fillLinearGradientEndPointX', 0);
            Factory.addGetterSetter(Shape, 'strokeLinearGradientEndPointX', 0);
            Factory.addGetterSetter(Shape, 'fillLinearGradientEndPointY', 0);
            Factory.addGetterSetter(Shape, 'strokeLinearGradientEndPointY', 0);
            Factory.addComponentsGetterSetter(Shape, 'fillRadialGradientStartPoint', [
                'x',
                'y',
            ]);
            Factory.addGetterSetter(Shape, 'fillRadialGradientStartPointX', 0);
            Factory.addGetterSetter(Shape, 'fillRadialGradientStartPointY', 0);
            Factory.addComponentsGetterSetter(Shape, 'fillRadialGradientEndPoint', [
                'x',
                'y',
            ]);
            Factory.addGetterSetter(Shape, 'fillRadialGradientEndPointX', 0);
            Factory.addGetterSetter(Shape, 'fillRadialGradientEndPointY', 0);
            Factory.addGetterSetter(Shape, 'fillPatternRotation', 0);
            Factory.backCompat(Shape, {
                dashArray: 'dash',
                getDashArray: 'getDash',
                setDashArray: 'getDash',
                drawFunc: 'sceneFunc',
                getDrawFunc: 'getSceneFunc',
                setDrawFunc: 'setSceneFunc',
                drawHitFunc: 'hitFunc',
                getDrawHitFunc: 'getHitFunc',
                setDrawHitFunc: 'setHitFunc',
            });

            var HASH = '#', BEFORE_DRAW = 'beforeDraw', DRAW = 'draw', INTERSECTION_OFFSETS = [
                { x: 0, y: 0 },
                { x: -1, y: -1 },
                { x: 1, y: -1 },
                { x: 1, y: 1 },
                { x: -1, y: 1 },
            ], INTERSECTION_OFFSETS_LEN = INTERSECTION_OFFSETS.length;
            class Layer$1 extends Container {
                constructor(config) {
                    super(config);
                    this.canvas = new SceneCanvas();
                    this.hitCanvas = new HitCanvas({
                        pixelRatio: 1,
                    });
                    this._waitingForDraw = false;
                    this.on('visibleChange.konva', this._checkVisibility);
                    this._checkVisibility();
                    this.on('imageSmoothingEnabledChange.konva', this._setSmoothEnabled);
                    this._setSmoothEnabled();
                }
                createPNGStream() {
                    const c = this.canvas._canvas;
                    return c.createPNGStream();
                }
                getCanvas() {
                    return this.canvas;
                }
                getNativeCanvasElement() {
                    return this.canvas._canvas;
                }
                getHitCanvas() {
                    return this.hitCanvas;
                }
                getContext() {
                    return this.getCanvas().getContext();
                }
                clear(bounds) {
                    this.getContext().clear(bounds);
                    this.getHitCanvas().getContext().clear(bounds);
                    return this;
                }
                setZIndex(index) {
                    super.setZIndex(index);
                    var stage = this.getStage();
                    if (stage && stage.content) {
                        stage.content.removeChild(this.getNativeCanvasElement());
                        if (index < stage.children.length - 1) {
                            stage.content.insertBefore(this.getNativeCanvasElement(), stage.children[index + 1].getCanvas()._canvas);
                        }
                        else {
                            stage.content.appendChild(this.getNativeCanvasElement());
                        }
                    }
                    return this;
                }
                moveToTop() {
                    Node.prototype.moveToTop.call(this);
                    var stage = this.getStage();
                    if (stage && stage.content) {
                        stage.content.removeChild(this.getNativeCanvasElement());
                        stage.content.appendChild(this.getNativeCanvasElement());
                    }
                    return true;
                }
                moveUp() {
                    var moved = Node.prototype.moveUp.call(this);
                    if (!moved) {
                        return false;
                    }
                    var stage = this.getStage();
                    if (!stage || !stage.content) {
                        return false;
                    }
                    stage.content.removeChild(this.getNativeCanvasElement());
                    if (this.index < stage.children.length - 1) {
                        stage.content.insertBefore(this.getNativeCanvasElement(), stage.children[this.index + 1].getCanvas()._canvas);
                    }
                    else {
                        stage.content.appendChild(this.getNativeCanvasElement());
                    }
                    return true;
                }
                moveDown() {
                    if (Node.prototype.moveDown.call(this)) {
                        var stage = this.getStage();
                        if (stage) {
                            var children = stage.children;
                            if (stage.content) {
                                stage.content.removeChild(this.getNativeCanvasElement());
                                stage.content.insertBefore(this.getNativeCanvasElement(), children[this.index + 1].getCanvas()._canvas);
                            }
                        }
                        return true;
                    }
                    return false;
                }
                moveToBottom() {
                    if (Node.prototype.moveToBottom.call(this)) {
                        var stage = this.getStage();
                        if (stage) {
                            var children = stage.children;
                            if (stage.content) {
                                stage.content.removeChild(this.getNativeCanvasElement());
                                stage.content.insertBefore(this.getNativeCanvasElement(), children[1].getCanvas()._canvas);
                            }
                        }
                        return true;
                    }
                    return false;
                }
                getLayer() {
                    return this;
                }
                remove() {
                    var _canvas = this.getNativeCanvasElement();
                    Node.prototype.remove.call(this);
                    if (_canvas && _canvas.parentNode && Util._isInDocument(_canvas)) {
                        _canvas.parentNode.removeChild(_canvas);
                    }
                    return this;
                }
                getStage() {
                    return this.parent;
                }
                setSize({ width, height }) {
                    this.canvas.setSize(width, height);
                    this.hitCanvas.setSize(width, height);
                    this._setSmoothEnabled();
                    return this;
                }
                _validateAdd(child) {
                    var type = child.getType();
                    if (type !== 'Group' && type !== 'Shape') {
                        Util.throw('You may only add groups and shapes to a layer.');
                    }
                }
                _toKonvaCanvas(config) {
                    config = config || {};
                    config.width = config.width || this.getWidth();
                    config.height = config.height || this.getHeight();
                    config.x = config.x !== undefined ? config.x : this.x();
                    config.y = config.y !== undefined ? config.y : this.y();
                    return Node.prototype._toKonvaCanvas.call(this, config);
                }
                _checkVisibility() {
                    const visible = this.visible();
                    if (visible) {
                        this.canvas._canvas.style.display = 'block';
                    }
                    else {
                        this.canvas._canvas.style.display = 'none';
                    }
                }
                _setSmoothEnabled() {
                    this.getContext()._context.imageSmoothingEnabled =
                        this.imageSmoothingEnabled();
                }
                getWidth() {
                    if (this.parent) {
                        return this.parent.width();
                    }
                }
                setWidth() {
                    Util.warn('Can not change width of layer. Use "stage.width(value)" function instead.');
                }
                getHeight() {
                    if (this.parent) {
                        return this.parent.height();
                    }
                }
                setHeight() {
                    Util.warn('Can not change height of layer. Use "stage.height(value)" function instead.');
                }
                batchDraw() {
                    if (!this._waitingForDraw) {
                        this._waitingForDraw = true;
                        Util.requestAnimFrame(() => {
                            this.draw();
                            this._waitingForDraw = false;
                        });
                    }
                    return this;
                }
                getIntersection(pos) {
                    if (!this.isListening() || !this.isVisible()) {
                        return null;
                    }
                    var spiralSearchDistance = 1;
                    var continueSearch = false;
                    while (true) {
                        for (let i = 0; i < INTERSECTION_OFFSETS_LEN; i++) {
                            const intersectionOffset = INTERSECTION_OFFSETS[i];
                            const obj = this._getIntersection({
                                x: pos.x + intersectionOffset.x * spiralSearchDistance,
                                y: pos.y + intersectionOffset.y * spiralSearchDistance,
                            });
                            const shape = obj.shape;
                            if (shape) {
                                return shape;
                            }
                            continueSearch = !!obj.antialiased;
                            if (!obj.antialiased) {
                                break;
                            }
                        }
                        if (continueSearch) {
                            spiralSearchDistance += 1;
                        }
                        else {
                            return null;
                        }
                    }
                }
                _getIntersection(pos) {
                    const ratio = this.hitCanvas.pixelRatio;
                    const p = this.hitCanvas.context.getImageData(Math.round(pos.x * ratio), Math.round(pos.y * ratio), 1, 1).data;
                    const p3 = p[3];
                    if (p3 === 255) {
                        const colorKey = Util._rgbToHex(p[0], p[1], p[2]);
                        const shape = shapes[HASH + colorKey];
                        if (shape) {
                            return {
                                shape: shape,
                            };
                        }
                        return {
                            antialiased: true,
                        };
                    }
                    else if (p3 > 0) {
                        return {
                            antialiased: true,
                        };
                    }
                    return {};
                }
                drawScene(can, top) {
                    var layer = this.getLayer(), canvas = can || (layer && layer.getCanvas());
                    this._fire(BEFORE_DRAW, {
                        node: this,
                    });
                    if (this.clearBeforeDraw()) {
                        canvas.getContext().clear();
                    }
                    Container.prototype.drawScene.call(this, canvas, top);
                    this._fire(DRAW, {
                        node: this,
                    });
                    return this;
                }
                drawHit(can, top) {
                    var layer = this.getLayer(), canvas = can || (layer && layer.hitCanvas);
                    if (layer && layer.clearBeforeDraw()) {
                        layer.getHitCanvas().getContext().clear();
                    }
                    Container.prototype.drawHit.call(this, canvas, top);
                    return this;
                }
                enableHitGraph() {
                    this.hitGraphEnabled(true);
                    return this;
                }
                disableHitGraph() {
                    this.hitGraphEnabled(false);
                    return this;
                }
                setHitGraphEnabled(val) {
                    Util.warn('hitGraphEnabled method is deprecated. Please use layer.listening() instead.');
                    this.listening(val);
                }
                getHitGraphEnabled(val) {
                    Util.warn('hitGraphEnabled method is deprecated. Please use layer.listening() instead.');
                    return this.listening();
                }
                toggleHitCanvas() {
                    if (!this.parent || !this.parent['content']) {
                        return;
                    }
                    var parent = this.parent;
                    var added = !!this.hitCanvas._canvas.parentNode;
                    if (added) {
                        parent.content.removeChild(this.hitCanvas._canvas);
                    }
                    else {
                        parent.content.appendChild(this.hitCanvas._canvas);
                    }
                }
                destroy() {
                    Util.releaseCanvas(this.getNativeCanvasElement(), this.getHitCanvas()._canvas);
                    return super.destroy();
                }
            }
            Layer$1.prototype.nodeType = 'Layer';
            _registerNode(Layer$1);
            Factory.addGetterSetter(Layer$1, 'imageSmoothingEnabled', true);
            Factory.addGetterSetter(Layer$1, 'clearBeforeDraw', true);
            Factory.addGetterSetter(Layer$1, 'hitGraphEnabled', true, getBooleanValidator());

            class FastLayer extends Layer$1 {
                constructor(attrs) {
                    super(attrs);
                    this.listening(false);
                    Util.warn('Konva.Fast layer is deprecated. Please use "new Konva.Layer({ listening: false })" instead.');
                }
            }
            FastLayer.prototype.nodeType = 'FastLayer';
            _registerNode(FastLayer);

            class Group$2 extends Container {
                _validateAdd(child) {
                    var type = child.getType();
                    if (type !== 'Group' && type !== 'Shape') {
                        Util.throw('You may only add groups and shapes to groups.');
                    }
                }
            }
            Group$2.prototype.nodeType = 'Group';
            _registerNode(Group$2);

            var now = (function () {
                if (glob.performance && glob.performance.now) {
                    return function () {
                        return glob.performance.now();
                    };
                }
                return function () {
                    return new Date().getTime();
                };
            })();
            class Animation {
                constructor(func, layers) {
                    this.id = Animation.animIdCounter++;
                    this.frame = {
                        time: 0,
                        timeDiff: 0,
                        lastTime: now(),
                        frameRate: 0,
                    };
                    this.func = func;
                    this.setLayers(layers);
                }
                setLayers(layers) {
                    var lays = [];
                    if (!layers) {
                        lays = [];
                    }
                    else if (layers.length > 0) {
                        lays = layers;
                    }
                    else {
                        lays = [layers];
                    }
                    this.layers = lays;
                    return this;
                }
                getLayers() {
                    return this.layers;
                }
                addLayer(layer) {
                    var layers = this.layers, len = layers.length, n;
                    for (n = 0; n < len; n++) {
                        if (layers[n]._id === layer._id) {
                            return false;
                        }
                    }
                    this.layers.push(layer);
                    return true;
                }
                isRunning() {
                    var a = Animation, animations = a.animations, len = animations.length, n;
                    for (n = 0; n < len; n++) {
                        if (animations[n].id === this.id) {
                            return true;
                        }
                    }
                    return false;
                }
                start() {
                    this.stop();
                    this.frame.timeDiff = 0;
                    this.frame.lastTime = now();
                    Animation._addAnimation(this);
                    return this;
                }
                stop() {
                    Animation._removeAnimation(this);
                    return this;
                }
                _updateFrameObject(time) {
                    this.frame.timeDiff = time - this.frame.lastTime;
                    this.frame.lastTime = time;
                    this.frame.time += this.frame.timeDiff;
                    this.frame.frameRate = 1000 / this.frame.timeDiff;
                }
                static _addAnimation(anim) {
                    this.animations.push(anim);
                    this._handleAnimation();
                }
                static _removeAnimation(anim) {
                    var id = anim.id, animations = this.animations, len = animations.length, n;
                    for (n = 0; n < len; n++) {
                        if (animations[n].id === id) {
                            this.animations.splice(n, 1);
                            break;
                        }
                    }
                }
                static _runFrames() {
                    var layerHash = {}, animations = this.animations, anim, layers, func, n, i, layersLen, layer, key, needRedraw;
                    for (n = 0; n < animations.length; n++) {
                        anim = animations[n];
                        layers = anim.layers;
                        func = anim.func;
                        anim._updateFrameObject(now());
                        layersLen = layers.length;
                        if (func) {
                            needRedraw = func.call(anim, anim.frame) !== false;
                        }
                        else {
                            needRedraw = true;
                        }
                        if (!needRedraw) {
                            continue;
                        }
                        for (i = 0; i < layersLen; i++) {
                            layer = layers[i];
                            if (layer._id !== undefined) {
                                layerHash[layer._id] = layer;
                            }
                        }
                    }
                    for (key in layerHash) {
                        if (!layerHash.hasOwnProperty(key)) {
                            continue;
                        }
                        layerHash[key].batchDraw();
                    }
                }
                static _animationLoop() {
                    var Anim = Animation;
                    if (Anim.animations.length) {
                        Anim._runFrames();
                        Util.requestAnimFrame(Anim._animationLoop);
                    }
                    else {
                        Anim.animRunning = false;
                    }
                }
                static _handleAnimation() {
                    if (!this.animRunning) {
                        this.animRunning = true;
                        Util.requestAnimFrame(this._animationLoop);
                    }
                }
            }
            Animation.animations = [];
            Animation.animIdCounter = 0;
            Animation.animRunning = false;

            var blacklist = {
                node: 1,
                duration: 1,
                easing: 1,
                onFinish: 1,
                yoyo: 1,
            }, PAUSED = 1, PLAYING = 2, REVERSING = 3, idCounter = 0, colorAttrs = ['fill', 'stroke', 'shadowColor'];
            class TweenEngine {
                constructor(prop, propFunc, func, begin, finish, duration, yoyo) {
                    this.prop = prop;
                    this.propFunc = propFunc;
                    this.begin = begin;
                    this._pos = begin;
                    this.duration = duration;
                    this._change = 0;
                    this.prevPos = 0;
                    this.yoyo = yoyo;
                    this._time = 0;
                    this._position = 0;
                    this._startTime = 0;
                    this._finish = 0;
                    this.func = func;
                    this._change = finish - this.begin;
                    this.pause();
                }
                fire(str) {
                    var handler = this[str];
                    if (handler) {
                        handler();
                    }
                }
                setTime(t) {
                    if (t > this.duration) {
                        if (this.yoyo) {
                            this._time = this.duration;
                            this.reverse();
                        }
                        else {
                            this.finish();
                        }
                    }
                    else if (t < 0) {
                        if (this.yoyo) {
                            this._time = 0;
                            this.play();
                        }
                        else {
                            this.reset();
                        }
                    }
                    else {
                        this._time = t;
                        this.update();
                    }
                }
                getTime() {
                    return this._time;
                }
                setPosition(p) {
                    this.prevPos = this._pos;
                    this.propFunc(p);
                    this._pos = p;
                }
                getPosition(t) {
                    if (t === undefined) {
                        t = this._time;
                    }
                    return this.func(t, this.begin, this._change, this.duration);
                }
                play() {
                    this.state = PLAYING;
                    this._startTime = this.getTimer() - this._time;
                    this.onEnterFrame();
                    this.fire('onPlay');
                }
                reverse() {
                    this.state = REVERSING;
                    this._time = this.duration - this._time;
                    this._startTime = this.getTimer() - this._time;
                    this.onEnterFrame();
                    this.fire('onReverse');
                }
                seek(t) {
                    this.pause();
                    this._time = t;
                    this.update();
                    this.fire('onSeek');
                }
                reset() {
                    this.pause();
                    this._time = 0;
                    this.update();
                    this.fire('onReset');
                }
                finish() {
                    this.pause();
                    this._time = this.duration;
                    this.update();
                    this.fire('onFinish');
                }
                update() {
                    this.setPosition(this.getPosition(this._time));
                    this.fire('onUpdate');
                }
                onEnterFrame() {
                    var t = this.getTimer() - this._startTime;
                    if (this.state === PLAYING) {
                        this.setTime(t);
                    }
                    else if (this.state === REVERSING) {
                        this.setTime(this.duration - t);
                    }
                }
                pause() {
                    this.state = PAUSED;
                    this.fire('onPause');
                }
                getTimer() {
                    return new Date().getTime();
                }
            }
            class Tween {
                constructor(config) {
                    var that = this, node = config.node, nodeId = node._id, duration, easing = config.easing || Easings.Linear, yoyo = !!config.yoyo, key;
                    if (typeof config.duration === 'undefined') {
                        duration = 0.3;
                    }
                    else if (config.duration === 0) {
                        duration = 0.001;
                    }
                    else {
                        duration = config.duration;
                    }
                    this.node = node;
                    this._id = idCounter++;
                    var layers = node.getLayer() ||
                        (node instanceof Konva$2['Stage'] ? node.getLayers() : null);
                    if (!layers) {
                        Util.error('Tween constructor have `node` that is not in a layer. Please add node into layer first.');
                    }
                    this.anim = new Animation(function () {
                        that.tween.onEnterFrame();
                    }, layers);
                    this.tween = new TweenEngine(key, function (i) {
                        that._tweenFunc(i);
                    }, easing, 0, 1, duration * 1000, yoyo);
                    this._addListeners();
                    if (!Tween.attrs[nodeId]) {
                        Tween.attrs[nodeId] = {};
                    }
                    if (!Tween.attrs[nodeId][this._id]) {
                        Tween.attrs[nodeId][this._id] = {};
                    }
                    if (!Tween.tweens[nodeId]) {
                        Tween.tweens[nodeId] = {};
                    }
                    for (key in config) {
                        if (blacklist[key] === undefined) {
                            this._addAttr(key, config[key]);
                        }
                    }
                    this.reset();
                    this.onFinish = config.onFinish;
                    this.onReset = config.onReset;
                    this.onUpdate = config.onUpdate;
                }
                _addAttr(key, end) {
                    var node = this.node, nodeId = node._id, start, diff, tweenId, n, len, trueEnd, trueStart, endRGBA;
                    tweenId = Tween.tweens[nodeId][key];
                    if (tweenId) {
                        delete Tween.attrs[nodeId][tweenId][key];
                    }
                    start = node.getAttr(key);
                    if (Util._isArray(end)) {
                        diff = [];
                        len = Math.max(end.length, start.length);
                        if (key === 'points' && end.length !== start.length) {
                            if (end.length > start.length) {
                                trueStart = start;
                                start = Util._prepareArrayForTween(start, end, node.closed());
                            }
                            else {
                                trueEnd = end;
                                end = Util._prepareArrayForTween(end, start, node.closed());
                            }
                        }
                        if (key.indexOf('fill') === 0) {
                            for (n = 0; n < len; n++) {
                                if (n % 2 === 0) {
                                    diff.push(end[n] - start[n]);
                                }
                                else {
                                    var startRGBA = Util.colorToRGBA(start[n]);
                                    endRGBA = Util.colorToRGBA(end[n]);
                                    start[n] = startRGBA;
                                    diff.push({
                                        r: endRGBA.r - startRGBA.r,
                                        g: endRGBA.g - startRGBA.g,
                                        b: endRGBA.b - startRGBA.b,
                                        a: endRGBA.a - startRGBA.a,
                                    });
                                }
                            }
                        }
                        else {
                            for (n = 0; n < len; n++) {
                                diff.push(end[n] - start[n]);
                            }
                        }
                    }
                    else if (colorAttrs.indexOf(key) !== -1) {
                        start = Util.colorToRGBA(start);
                        endRGBA = Util.colorToRGBA(end);
                        diff = {
                            r: endRGBA.r - start.r,
                            g: endRGBA.g - start.g,
                            b: endRGBA.b - start.b,
                            a: endRGBA.a - start.a,
                        };
                    }
                    else {
                        diff = end - start;
                    }
                    Tween.attrs[nodeId][this._id][key] = {
                        start: start,
                        diff: diff,
                        end: end,
                        trueEnd: trueEnd,
                        trueStart: trueStart,
                    };
                    Tween.tweens[nodeId][key] = this._id;
                }
                _tweenFunc(i) {
                    var node = this.node, attrs = Tween.attrs[node._id][this._id], key, attr, start, diff, newVal, n, len, end;
                    for (key in attrs) {
                        attr = attrs[key];
                        start = attr.start;
                        diff = attr.diff;
                        end = attr.end;
                        if (Util._isArray(start)) {
                            newVal = [];
                            len = Math.max(start.length, end.length);
                            if (key.indexOf('fill') === 0) {
                                for (n = 0; n < len; n++) {
                                    if (n % 2 === 0) {
                                        newVal.push((start[n] || 0) + diff[n] * i);
                                    }
                                    else {
                                        newVal.push('rgba(' +
                                            Math.round(start[n].r + diff[n].r * i) +
                                            ',' +
                                            Math.round(start[n].g + diff[n].g * i) +
                                            ',' +
                                            Math.round(start[n].b + diff[n].b * i) +
                                            ',' +
                                            (start[n].a + diff[n].a * i) +
                                            ')');
                                    }
                                }
                            }
                            else {
                                for (n = 0; n < len; n++) {
                                    newVal.push((start[n] || 0) + diff[n] * i);
                                }
                            }
                        }
                        else if (colorAttrs.indexOf(key) !== -1) {
                            newVal =
                                'rgba(' +
                                    Math.round(start.r + diff.r * i) +
                                    ',' +
                                    Math.round(start.g + diff.g * i) +
                                    ',' +
                                    Math.round(start.b + diff.b * i) +
                                    ',' +
                                    (start.a + diff.a * i) +
                                    ')';
                        }
                        else {
                            newVal = start + diff * i;
                        }
                        node.setAttr(key, newVal);
                    }
                }
                _addListeners() {
                    this.tween.onPlay = () => {
                        this.anim.start();
                    };
                    this.tween.onReverse = () => {
                        this.anim.start();
                    };
                    this.tween.onPause = () => {
                        this.anim.stop();
                    };
                    this.tween.onFinish = () => {
                        var node = this.node;
                        var attrs = Tween.attrs[node._id][this._id];
                        if (attrs.points && attrs.points.trueEnd) {
                            node.setAttr('points', attrs.points.trueEnd);
                        }
                        if (this.onFinish) {
                            this.onFinish.call(this);
                        }
                    };
                    this.tween.onReset = () => {
                        var node = this.node;
                        var attrs = Tween.attrs[node._id][this._id];
                        if (attrs.points && attrs.points.trueStart) {
                            node.points(attrs.points.trueStart);
                        }
                        if (this.onReset) {
                            this.onReset();
                        }
                    };
                    this.tween.onUpdate = () => {
                        if (this.onUpdate) {
                            this.onUpdate.call(this);
                        }
                    };
                }
                play() {
                    this.tween.play();
                    return this;
                }
                reverse() {
                    this.tween.reverse();
                    return this;
                }
                reset() {
                    this.tween.reset();
                    return this;
                }
                seek(t) {
                    this.tween.seek(t * 1000);
                    return this;
                }
                pause() {
                    this.tween.pause();
                    return this;
                }
                finish() {
                    this.tween.finish();
                    return this;
                }
                destroy() {
                    var nodeId = this.node._id, thisId = this._id, attrs = Tween.tweens[nodeId], key;
                    this.pause();
                    for (key in attrs) {
                        delete Tween.tweens[nodeId][key];
                    }
                    delete Tween.attrs[nodeId][thisId];
                }
            }
            Tween.attrs = {};
            Tween.tweens = {};
            Node.prototype.to = function (params) {
                var onFinish = params.onFinish;
                params.node = this;
                params.onFinish = function () {
                    this.destroy();
                    if (onFinish) {
                        onFinish();
                    }
                };
                var tween = new Tween(params);
                tween.play();
            };
            const Easings = {
                BackEaseIn(t, b, c, d) {
                    var s = 1.70158;
                    return c * (t /= d) * t * ((s + 1) * t - s) + b;
                },
                BackEaseOut(t, b, c, d) {
                    var s = 1.70158;
                    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
                },
                BackEaseInOut(t, b, c, d) {
                    var s = 1.70158;
                    if ((t /= d / 2) < 1) {
                        return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
                    }
                    return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
                },
                ElasticEaseIn(t, b, c, d, a, p) {
                    var s = 0;
                    if (t === 0) {
                        return b;
                    }
                    if ((t /= d) === 1) {
                        return b + c;
                    }
                    if (!p) {
                        p = d * 0.3;
                    }
                    if (!a || a < Math.abs(c)) {
                        a = c;
                        s = p / 4;
                    }
                    else {
                        s = (p / (2 * Math.PI)) * Math.asin(c / a);
                    }
                    return (-(a *
                        Math.pow(2, 10 * (t -= 1)) *
                        Math.sin(((t * d - s) * (2 * Math.PI)) / p)) + b);
                },
                ElasticEaseOut(t, b, c, d, a, p) {
                    var s = 0;
                    if (t === 0) {
                        return b;
                    }
                    if ((t /= d) === 1) {
                        return b + c;
                    }
                    if (!p) {
                        p = d * 0.3;
                    }
                    if (!a || a < Math.abs(c)) {
                        a = c;
                        s = p / 4;
                    }
                    else {
                        s = (p / (2 * Math.PI)) * Math.asin(c / a);
                    }
                    return (a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) +
                        c +
                        b);
                },
                ElasticEaseInOut(t, b, c, d, a, p) {
                    var s = 0;
                    if (t === 0) {
                        return b;
                    }
                    if ((t /= d / 2) === 2) {
                        return b + c;
                    }
                    if (!p) {
                        p = d * (0.3 * 1.5);
                    }
                    if (!a || a < Math.abs(c)) {
                        a = c;
                        s = p / 4;
                    }
                    else {
                        s = (p / (2 * Math.PI)) * Math.asin(c / a);
                    }
                    if (t < 1) {
                        return (-0.5 *
                            (a *
                                Math.pow(2, 10 * (t -= 1)) *
                                Math.sin(((t * d - s) * (2 * Math.PI)) / p)) +
                            b);
                    }
                    return (a *
                        Math.pow(2, -10 * (t -= 1)) *
                        Math.sin(((t * d - s) * (2 * Math.PI)) / p) *
                        0.5 +
                        c +
                        b);
                },
                BounceEaseOut(t, b, c, d) {
                    if ((t /= d) < 1 / 2.75) {
                        return c * (7.5625 * t * t) + b;
                    }
                    else if (t < 2 / 2.75) {
                        return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
                    }
                    else if (t < 2.5 / 2.75) {
                        return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
                    }
                    else {
                        return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
                    }
                },
                BounceEaseIn(t, b, c, d) {
                    return c - Easings.BounceEaseOut(d - t, 0, c, d) + b;
                },
                BounceEaseInOut(t, b, c, d) {
                    if (t < d / 2) {
                        return Easings.BounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
                    }
                    else {
                        return Easings.BounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
                    }
                },
                EaseIn(t, b, c, d) {
                    return c * (t /= d) * t + b;
                },
                EaseOut(t, b, c, d) {
                    return -c * (t /= d) * (t - 2) + b;
                },
                EaseInOut(t, b, c, d) {
                    if ((t /= d / 2) < 1) {
                        return (c / 2) * t * t + b;
                    }
                    return (-c / 2) * (--t * (t - 2) - 1) + b;
                },
                StrongEaseIn(t, b, c, d) {
                    return c * (t /= d) * t * t * t * t + b;
                },
                StrongEaseOut(t, b, c, d) {
                    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
                },
                StrongEaseInOut(t, b, c, d) {
                    if ((t /= d / 2) < 1) {
                        return (c / 2) * t * t * t * t * t + b;
                    }
                    return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
                },
                Linear(t, b, c, d) {
                    return (c * t) / d + b;
                },
            };

            const Konva$1 = Util._assign(Konva$2, {
                Util,
                Transform,
                Node,
                Container,
                Stage,
                stages,
                Layer: Layer$1,
                FastLayer,
                Group: Group$2,
                DD,
                Shape,
                shapes,
                Animation,
                Tween,
                Easings,
                Context: Context$1,
                Canvas,
            });

            class Arc extends Shape {
                _sceneFunc(context) {
                    var angle = Konva$2.getAngle(this.angle()), clockwise = this.clockwise();
                    context.beginPath();
                    context.arc(0, 0, this.outerRadius(), 0, angle, clockwise);
                    context.arc(0, 0, this.innerRadius(), angle, 0, !clockwise);
                    context.closePath();
                    context.fillStrokeShape(this);
                }
                getWidth() {
                    return this.outerRadius() * 2;
                }
                getHeight() {
                    return this.outerRadius() * 2;
                }
                setWidth(width) {
                    this.outerRadius(width / 2);
                }
                setHeight(height) {
                    this.outerRadius(height / 2);
                }
                getSelfRect() {
                    const innerRadius = this.innerRadius();
                    const outerRadius = this.outerRadius();
                    const clockwise = this.clockwise();
                    const angle = Konva$2.getAngle(clockwise ? 360 - this.angle() : this.angle());
                    const boundLeftRatio = Math.cos(Math.min(angle, Math.PI));
                    const boundRightRatio = 1;
                    const boundTopRatio = Math.sin(Math.min(Math.max(Math.PI, angle), (3 * Math.PI) / 2));
                    const boundBottomRatio = Math.sin(Math.min(angle, Math.PI / 2));
                    const boundLeft = boundLeftRatio * (boundLeftRatio > 0 ? innerRadius : outerRadius);
                    const boundRight = boundRightRatio * (outerRadius );
                    const boundTop = boundTopRatio * (boundTopRatio > 0 ? innerRadius : outerRadius);
                    const boundBottom = boundBottomRatio * (boundBottomRatio > 0 ? outerRadius : innerRadius);
                    return {
                        x: boundLeft,
                        y: clockwise ? -1 * boundBottom : boundTop,
                        width: boundRight - boundLeft,
                        height: boundBottom - boundTop,
                    };
                }
            }
            Arc.prototype._centroid = true;
            Arc.prototype.className = 'Arc';
            Arc.prototype._attrsAffectingSize = ['innerRadius', 'outerRadius'];
            _registerNode(Arc);
            Factory.addGetterSetter(Arc, 'innerRadius', 0, getNumberValidator());
            Factory.addGetterSetter(Arc, 'outerRadius', 0, getNumberValidator());
            Factory.addGetterSetter(Arc, 'angle', 0, getNumberValidator());
            Factory.addGetterSetter(Arc, 'clockwise', false, getBooleanValidator());

            function getControlPoints(x0, y0, x1, y1, x2, y2, t) {
                var d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)), d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)), fa = (t * d01) / (d01 + d12), fb = (t * d12) / (d01 + d12), p1x = x1 - fa * (x2 - x0), p1y = y1 - fa * (y2 - y0), p2x = x1 + fb * (x2 - x0), p2y = y1 + fb * (y2 - y0);
                return [p1x, p1y, p2x, p2y];
            }
            function expandPoints(p, tension) {
                var len = p.length, allPoints = [], n, cp;
                for (n = 2; n < len - 2; n += 2) {
                    cp = getControlPoints(p[n - 2], p[n - 1], p[n], p[n + 1], p[n + 2], p[n + 3], tension);
                    if (isNaN(cp[0])) {
                        continue;
                    }
                    allPoints.push(cp[0]);
                    allPoints.push(cp[1]);
                    allPoints.push(p[n]);
                    allPoints.push(p[n + 1]);
                    allPoints.push(cp[2]);
                    allPoints.push(cp[3]);
                }
                return allPoints;
            }
            class Line$2 extends Shape {
                constructor(config) {
                    super(config);
                    this.on('pointsChange.konva tensionChange.konva closedChange.konva bezierChange.konva', function () {
                        this._clearCache('tensionPoints');
                    });
                }
                _sceneFunc(context) {
                    var points = this.points(), length = points.length, tension = this.tension(), closed = this.closed(), bezier = this.bezier(), tp, len, n;
                    if (!length) {
                        return;
                    }
                    context.beginPath();
                    context.moveTo(points[0], points[1]);
                    if (tension !== 0 && length > 4) {
                        tp = this.getTensionPoints();
                        len = tp.length;
                        n = closed ? 0 : 4;
                        if (!closed) {
                            context.quadraticCurveTo(tp[0], tp[1], tp[2], tp[3]);
                        }
                        while (n < len - 2) {
                            context.bezierCurveTo(tp[n++], tp[n++], tp[n++], tp[n++], tp[n++], tp[n++]);
                        }
                        if (!closed) {
                            context.quadraticCurveTo(tp[len - 2], tp[len - 1], points[length - 2], points[length - 1]);
                        }
                    }
                    else if (bezier) {
                        n = 2;
                        while (n < length) {
                            context.bezierCurveTo(points[n++], points[n++], points[n++], points[n++], points[n++], points[n++]);
                        }
                    }
                    else {
                        for (n = 2; n < length; n += 2) {
                            context.lineTo(points[n], points[n + 1]);
                        }
                    }
                    if (closed) {
                        context.closePath();
                        context.fillStrokeShape(this);
                    }
                    else {
                        context.strokeShape(this);
                    }
                }
                getTensionPoints() {
                    return this._getCache('tensionPoints', this._getTensionPoints);
                }
                _getTensionPoints() {
                    if (this.closed()) {
                        return this._getTensionPointsClosed();
                    }
                    else {
                        return expandPoints(this.points(), this.tension());
                    }
                }
                _getTensionPointsClosed() {
                    var p = this.points(), len = p.length, tension = this.tension(), firstControlPoints = getControlPoints(p[len - 2], p[len - 1], p[0], p[1], p[2], p[3], tension), lastControlPoints = getControlPoints(p[len - 4], p[len - 3], p[len - 2], p[len - 1], p[0], p[1], tension), middle = expandPoints(p, tension), tp = [firstControlPoints[2], firstControlPoints[3]]
                        .concat(middle)
                        .concat([
                        lastControlPoints[0],
                        lastControlPoints[1],
                        p[len - 2],
                        p[len - 1],
                        lastControlPoints[2],
                        lastControlPoints[3],
                        firstControlPoints[0],
                        firstControlPoints[1],
                        p[0],
                        p[1],
                    ]);
                    return tp;
                }
                getWidth() {
                    return this.getSelfRect().width;
                }
                getHeight() {
                    return this.getSelfRect().height;
                }
                getSelfRect() {
                    var points = this.points();
                    if (points.length < 4) {
                        return {
                            x: points[0] || 0,
                            y: points[1] || 0,
                            width: 0,
                            height: 0,
                        };
                    }
                    if (this.tension() !== 0) {
                        points = [
                            points[0],
                            points[1],
                            ...this._getTensionPoints(),
                            points[points.length - 2],
                            points[points.length - 1],
                        ];
                    }
                    else {
                        points = this.points();
                    }
                    var minX = points[0];
                    var maxX = points[0];
                    var minY = points[1];
                    var maxY = points[1];
                    var x, y;
                    for (var i = 0; i < points.length / 2; i++) {
                        x = points[i * 2];
                        y = points[i * 2 + 1];
                        minX = Math.min(minX, x);
                        maxX = Math.max(maxX, x);
                        minY = Math.min(minY, y);
                        maxY = Math.max(maxY, y);
                    }
                    return {
                        x: minX,
                        y: minY,
                        width: maxX - minX,
                        height: maxY - minY,
                    };
                }
            }
            Line$2.prototype.className = 'Line';
            Line$2.prototype._attrsAffectingSize = ['points', 'bezier', 'tension'];
            _registerNode(Line$2);
            Factory.addGetterSetter(Line$2, 'closed', false);
            Factory.addGetterSetter(Line$2, 'bezier', false);
            Factory.addGetterSetter(Line$2, 'tension', 0, getNumberValidator());
            Factory.addGetterSetter(Line$2, 'points', [], getNumberArrayValidator());

            class Path extends Shape {
                constructor(config) {
                    super(config);
                    this.dataArray = [];
                    this.pathLength = 0;
                    this.dataArray = Path.parsePathData(this.data());
                    this.pathLength = 0;
                    for (var i = 0; i < this.dataArray.length; ++i) {
                        this.pathLength += this.dataArray[i].pathLength;
                    }
                    this.on('dataChange.konva', function () {
                        this.dataArray = Path.parsePathData(this.data());
                        this.pathLength = 0;
                        for (var i = 0; i < this.dataArray.length; ++i) {
                            this.pathLength += this.dataArray[i].pathLength;
                        }
                    });
                }
                _sceneFunc(context) {
                    var ca = this.dataArray;
                    context.beginPath();
                    var isClosed = false;
                    for (var n = 0; n < ca.length; n++) {
                        var c = ca[n].command;
                        var p = ca[n].points;
                        switch (c) {
                            case 'L':
                                context.lineTo(p[0], p[1]);
                                break;
                            case 'M':
                                context.moveTo(p[0], p[1]);
                                break;
                            case 'C':
                                context.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
                                break;
                            case 'Q':
                                context.quadraticCurveTo(p[0], p[1], p[2], p[3]);
                                break;
                            case 'A':
                                var cx = p[0], cy = p[1], rx = p[2], ry = p[3], theta = p[4], dTheta = p[5], psi = p[6], fs = p[7];
                                var r = rx > ry ? rx : ry;
                                var scaleX = rx > ry ? 1 : rx / ry;
                                var scaleY = rx > ry ? ry / rx : 1;
                                context.translate(cx, cy);
                                context.rotate(psi);
                                context.scale(scaleX, scaleY);
                                context.arc(0, 0, r, theta, theta + dTheta, 1 - fs);
                                context.scale(1 / scaleX, 1 / scaleY);
                                context.rotate(-psi);
                                context.translate(-cx, -cy);
                                break;
                            case 'z':
                                isClosed = true;
                                context.closePath();
                                break;
                        }
                    }
                    if (!isClosed && !this.hasFill()) {
                        context.strokeShape(this);
                    }
                    else {
                        context.fillStrokeShape(this);
                    }
                }
                getSelfRect() {
                    var points = [];
                    this.dataArray.forEach(function (data) {
                        if (data.command === 'A') {
                            var start = data.points[4];
                            var dTheta = data.points[5];
                            var end = data.points[4] + dTheta;
                            var inc = Math.PI / 180.0;
                            if (Math.abs(start - end) < inc) {
                                inc = Math.abs(start - end);
                            }
                            if (dTheta < 0) {
                                for (let t = start - inc; t > end; t -= inc) {
                                    const point = Path.getPointOnEllipticalArc(data.points[0], data.points[1], data.points[2], data.points[3], t, 0);
                                    points.push(point.x, point.y);
                                }
                            }
                            else {
                                for (let t = start + inc; t < end; t += inc) {
                                    const point = Path.getPointOnEllipticalArc(data.points[0], data.points[1], data.points[2], data.points[3], t, 0);
                                    points.push(point.x, point.y);
                                }
                            }
                        }
                        else if (data.command === 'C') {
                            for (let t = 0.0; t <= 1; t += 0.01) {
                                const point = Path.getPointOnCubicBezier(t, data.start.x, data.start.y, data.points[0], data.points[1], data.points[2], data.points[3], data.points[4], data.points[5]);
                                points.push(point.x, point.y);
                            }
                        }
                        else {
                            points = points.concat(data.points);
                        }
                    });
                    var minX = points[0];
                    var maxX = points[0];
                    var minY = points[1];
                    var maxY = points[1];
                    var x, y;
                    for (var i = 0; i < points.length / 2; i++) {
                        x = points[i * 2];
                        y = points[i * 2 + 1];
                        if (!isNaN(x)) {
                            minX = Math.min(minX, x);
                            maxX = Math.max(maxX, x);
                        }
                        if (!isNaN(y)) {
                            minY = Math.min(minY, y);
                            maxY = Math.max(maxY, y);
                        }
                    }
                    return {
                        x: minX,
                        y: minY,
                        width: maxX - minX,
                        height: maxY - minY,
                    };
                }
                getLength() {
                    return this.pathLength;
                }
                getPointAtLength(length) {
                    var point, i = 0, ii = this.dataArray.length;
                    if (!ii) {
                        return null;
                    }
                    while (i < ii && length > this.dataArray[i].pathLength) {
                        length -= this.dataArray[i].pathLength;
                        ++i;
                    }
                    if (i === ii) {
                        point = this.dataArray[i - 1].points.slice(-2);
                        return {
                            x: point[0],
                            y: point[1],
                        };
                    }
                    if (length < 0.01) {
                        point = this.dataArray[i].points.slice(0, 2);
                        return {
                            x: point[0],
                            y: point[1],
                        };
                    }
                    var cp = this.dataArray[i];
                    var p = cp.points;
                    switch (cp.command) {
                        case 'L':
                            return Path.getPointOnLine(length, cp.start.x, cp.start.y, p[0], p[1]);
                        case 'C':
                            return Path.getPointOnCubicBezier(length / cp.pathLength, cp.start.x, cp.start.y, p[0], p[1], p[2], p[3], p[4], p[5]);
                        case 'Q':
                            return Path.getPointOnQuadraticBezier(length / cp.pathLength, cp.start.x, cp.start.y, p[0], p[1], p[2], p[3]);
                        case 'A':
                            var cx = p[0], cy = p[1], rx = p[2], ry = p[3], theta = p[4], dTheta = p[5], psi = p[6];
                            theta += (dTheta * length) / cp.pathLength;
                            return Path.getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi);
                    }
                    return null;
                }
                static getLineLength(x1, y1, x2, y2) {
                    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
                }
                static getPointOnLine(dist, P1x, P1y, P2x, P2y, fromX, fromY) {
                    if (fromX === undefined) {
                        fromX = P1x;
                    }
                    if (fromY === undefined) {
                        fromY = P1y;
                    }
                    var m = (P2y - P1y) / (P2x - P1x + 0.00000001);
                    var run = Math.sqrt((dist * dist) / (1 + m * m));
                    if (P2x < P1x) {
                        run *= -1;
                    }
                    var rise = m * run;
                    var pt;
                    if (P2x === P1x) {
                        pt = {
                            x: fromX,
                            y: fromY + rise,
                        };
                    }
                    else if ((fromY - P1y) / (fromX - P1x + 0.00000001) === m) {
                        pt = {
                            x: fromX + run,
                            y: fromY + rise,
                        };
                    }
                    else {
                        var ix, iy;
                        var len = this.getLineLength(P1x, P1y, P2x, P2y);
                        var u = (fromX - P1x) * (P2x - P1x) + (fromY - P1y) * (P2y - P1y);
                        u = u / (len * len);
                        ix = P1x + u * (P2x - P1x);
                        iy = P1y + u * (P2y - P1y);
                        var pRise = this.getLineLength(fromX, fromY, ix, iy);
                        var pRun = Math.sqrt(dist * dist - pRise * pRise);
                        run = Math.sqrt((pRun * pRun) / (1 + m * m));
                        if (P2x < P1x) {
                            run *= -1;
                        }
                        rise = m * run;
                        pt = {
                            x: ix + run,
                            y: iy + rise,
                        };
                    }
                    return pt;
                }
                static getPointOnCubicBezier(pct, P1x, P1y, P2x, P2y, P3x, P3y, P4x, P4y) {
                    function CB1(t) {
                        return t * t * t;
                    }
                    function CB2(t) {
                        return 3 * t * t * (1 - t);
                    }
                    function CB3(t) {
                        return 3 * t * (1 - t) * (1 - t);
                    }
                    function CB4(t) {
                        return (1 - t) * (1 - t) * (1 - t);
                    }
                    var x = P4x * CB1(pct) + P3x * CB2(pct) + P2x * CB3(pct) + P1x * CB4(pct);
                    var y = P4y * CB1(pct) + P3y * CB2(pct) + P2y * CB3(pct) + P1y * CB4(pct);
                    return {
                        x: x,
                        y: y,
                    };
                }
                static getPointOnQuadraticBezier(pct, P1x, P1y, P2x, P2y, P3x, P3y) {
                    function QB1(t) {
                        return t * t;
                    }
                    function QB2(t) {
                        return 2 * t * (1 - t);
                    }
                    function QB3(t) {
                        return (1 - t) * (1 - t);
                    }
                    var x = P3x * QB1(pct) + P2x * QB2(pct) + P1x * QB3(pct);
                    var y = P3y * QB1(pct) + P2y * QB2(pct) + P1y * QB3(pct);
                    return {
                        x: x,
                        y: y,
                    };
                }
                static getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi) {
                    var cosPsi = Math.cos(psi), sinPsi = Math.sin(psi);
                    var pt = {
                        x: rx * Math.cos(theta),
                        y: ry * Math.sin(theta),
                    };
                    return {
                        x: cx + (pt.x * cosPsi - pt.y * sinPsi),
                        y: cy + (pt.x * sinPsi + pt.y * cosPsi),
                    };
                }
                static parsePathData(data) {
                    if (!data) {
                        return [];
                    }
                    var cs = data;
                    var cc = [
                        'm',
                        'M',
                        'l',
                        'L',
                        'v',
                        'V',
                        'h',
                        'H',
                        'z',
                        'Z',
                        'c',
                        'C',
                        'q',
                        'Q',
                        't',
                        'T',
                        's',
                        'S',
                        'a',
                        'A',
                    ];
                    cs = cs.replace(new RegExp(' ', 'g'), ',');
                    for (var n = 0; n < cc.length; n++) {
                        cs = cs.replace(new RegExp(cc[n], 'g'), '|' + cc[n]);
                    }
                    var arr = cs.split('|');
                    var ca = [];
                    var coords = [];
                    var cpx = 0;
                    var cpy = 0;
                    var re = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:e[-+]?\d+)?)/gi;
                    var match;
                    for (n = 1; n < arr.length; n++) {
                        var str = arr[n];
                        var c = str.charAt(0);
                        str = str.slice(1);
                        coords.length = 0;
                        while ((match = re.exec(str))) {
                            coords.push(match[0]);
                        }
                        var p = [];
                        for (var j = 0, jlen = coords.length; j < jlen; j++) {
                            if (coords[j] === '00') {
                                p.push(0, 0);
                                continue;
                            }
                            var parsed = parseFloat(coords[j]);
                            if (!isNaN(parsed)) {
                                p.push(parsed);
                            }
                            else {
                                p.push(0);
                            }
                        }
                        while (p.length > 0) {
                            if (isNaN(p[0])) {
                                break;
                            }
                            var cmd = null;
                            var points = [];
                            var startX = cpx, startY = cpy;
                            var prevCmd, ctlPtx, ctlPty;
                            var rx, ry, psi, fa, fs, x1, y1;
                            switch (c) {
                                case 'l':
                                    cpx += p.shift();
                                    cpy += p.shift();
                                    cmd = 'L';
                                    points.push(cpx, cpy);
                                    break;
                                case 'L':
                                    cpx = p.shift();
                                    cpy = p.shift();
                                    points.push(cpx, cpy);
                                    break;
                                case 'm':
                                    var dx = p.shift();
                                    var dy = p.shift();
                                    cpx += dx;
                                    cpy += dy;
                                    cmd = 'M';
                                    if (ca.length > 2 && ca[ca.length - 1].command === 'z') {
                                        for (var idx = ca.length - 2; idx >= 0; idx--) {
                                            if (ca[idx].command === 'M') {
                                                cpx = ca[idx].points[0] + dx;
                                                cpy = ca[idx].points[1] + dy;
                                                break;
                                            }
                                        }
                                    }
                                    points.push(cpx, cpy);
                                    c = 'l';
                                    break;
                                case 'M':
                                    cpx = p.shift();
                                    cpy = p.shift();
                                    cmd = 'M';
                                    points.push(cpx, cpy);
                                    c = 'L';
                                    break;
                                case 'h':
                                    cpx += p.shift();
                                    cmd = 'L';
                                    points.push(cpx, cpy);
                                    break;
                                case 'H':
                                    cpx = p.shift();
                                    cmd = 'L';
                                    points.push(cpx, cpy);
                                    break;
                                case 'v':
                                    cpy += p.shift();
                                    cmd = 'L';
                                    points.push(cpx, cpy);
                                    break;
                                case 'V':
                                    cpy = p.shift();
                                    cmd = 'L';
                                    points.push(cpx, cpy);
                                    break;
                                case 'C':
                                    points.push(p.shift(), p.shift(), p.shift(), p.shift());
                                    cpx = p.shift();
                                    cpy = p.shift();
                                    points.push(cpx, cpy);
                                    break;
                                case 'c':
                                    points.push(cpx + p.shift(), cpy + p.shift(), cpx + p.shift(), cpy + p.shift());
                                    cpx += p.shift();
                                    cpy += p.shift();
                                    cmd = 'C';
                                    points.push(cpx, cpy);
                                    break;
                                case 'S':
                                    ctlPtx = cpx;
                                    ctlPty = cpy;
                                    prevCmd = ca[ca.length - 1];
                                    if (prevCmd.command === 'C') {
                                        ctlPtx = cpx + (cpx - prevCmd.points[2]);
                                        ctlPty = cpy + (cpy - prevCmd.points[3]);
                                    }
                                    points.push(ctlPtx, ctlPty, p.shift(), p.shift());
                                    cpx = p.shift();
                                    cpy = p.shift();
                                    cmd = 'C';
                                    points.push(cpx, cpy);
                                    break;
                                case 's':
                                    ctlPtx = cpx;
                                    ctlPty = cpy;
                                    prevCmd = ca[ca.length - 1];
                                    if (prevCmd.command === 'C') {
                                        ctlPtx = cpx + (cpx - prevCmd.points[2]);
                                        ctlPty = cpy + (cpy - prevCmd.points[3]);
                                    }
                                    points.push(ctlPtx, ctlPty, cpx + p.shift(), cpy + p.shift());
                                    cpx += p.shift();
                                    cpy += p.shift();
                                    cmd = 'C';
                                    points.push(cpx, cpy);
                                    break;
                                case 'Q':
                                    points.push(p.shift(), p.shift());
                                    cpx = p.shift();
                                    cpy = p.shift();
                                    points.push(cpx, cpy);
                                    break;
                                case 'q':
                                    points.push(cpx + p.shift(), cpy + p.shift());
                                    cpx += p.shift();
                                    cpy += p.shift();
                                    cmd = 'Q';
                                    points.push(cpx, cpy);
                                    break;
                                case 'T':
                                    ctlPtx = cpx;
                                    ctlPty = cpy;
                                    prevCmd = ca[ca.length - 1];
                                    if (prevCmd.command === 'Q') {
                                        ctlPtx = cpx + (cpx - prevCmd.points[0]);
                                        ctlPty = cpy + (cpy - prevCmd.points[1]);
                                    }
                                    cpx = p.shift();
                                    cpy = p.shift();
                                    cmd = 'Q';
                                    points.push(ctlPtx, ctlPty, cpx, cpy);
                                    break;
                                case 't':
                                    ctlPtx = cpx;
                                    ctlPty = cpy;
                                    prevCmd = ca[ca.length - 1];
                                    if (prevCmd.command === 'Q') {
                                        ctlPtx = cpx + (cpx - prevCmd.points[0]);
                                        ctlPty = cpy + (cpy - prevCmd.points[1]);
                                    }
                                    cpx += p.shift();
                                    cpy += p.shift();
                                    cmd = 'Q';
                                    points.push(ctlPtx, ctlPty, cpx, cpy);
                                    break;
                                case 'A':
                                    rx = p.shift();
                                    ry = p.shift();
                                    psi = p.shift();
                                    fa = p.shift();
                                    fs = p.shift();
                                    x1 = cpx;
                                    y1 = cpy;
                                    cpx = p.shift();
                                    cpy = p.shift();
                                    cmd = 'A';
                                    points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                                    break;
                                case 'a':
                                    rx = p.shift();
                                    ry = p.shift();
                                    psi = p.shift();
                                    fa = p.shift();
                                    fs = p.shift();
                                    x1 = cpx;
                                    y1 = cpy;
                                    cpx += p.shift();
                                    cpy += p.shift();
                                    cmd = 'A';
                                    points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                                    break;
                            }
                            ca.push({
                                command: cmd || c,
                                points: points,
                                start: {
                                    x: startX,
                                    y: startY,
                                },
                                pathLength: this.calcLength(startX, startY, cmd || c, points),
                            });
                        }
                        if (c === 'z' || c === 'Z') {
                            ca.push({
                                command: 'z',
                                points: [],
                                start: undefined,
                                pathLength: 0,
                            });
                        }
                    }
                    return ca;
                }
                static calcLength(x, y, cmd, points) {
                    var len, p1, p2, t;
                    var path = Path;
                    switch (cmd) {
                        case 'L':
                            return path.getLineLength(x, y, points[0], points[1]);
                        case 'C':
                            len = 0.0;
                            p1 = path.getPointOnCubicBezier(0, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                            for (t = 0.01; t <= 1; t += 0.01) {
                                p2 = path.getPointOnCubicBezier(t, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                                len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                                p1 = p2;
                            }
                            return len;
                        case 'Q':
                            len = 0.0;
                            p1 = path.getPointOnQuadraticBezier(0, x, y, points[0], points[1], points[2], points[3]);
                            for (t = 0.01; t <= 1; t += 0.01) {
                                p2 = path.getPointOnQuadraticBezier(t, x, y, points[0], points[1], points[2], points[3]);
                                len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                                p1 = p2;
                            }
                            return len;
                        case 'A':
                            len = 0.0;
                            var start = points[4];
                            var dTheta = points[5];
                            var end = points[4] + dTheta;
                            var inc = Math.PI / 180.0;
                            if (Math.abs(start - end) < inc) {
                                inc = Math.abs(start - end);
                            }
                            p1 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], start, 0);
                            if (dTheta < 0) {
                                for (t = start - inc; t > end; t -= inc) {
                                    p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                                    len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                                    p1 = p2;
                                }
                            }
                            else {
                                for (t = start + inc; t < end; t += inc) {
                                    p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                                    len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                                    p1 = p2;
                                }
                            }
                            p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], end, 0);
                            len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                            return len;
                    }
                    return 0;
                }
                static convertEndpointToCenterParameterization(x1, y1, x2, y2, fa, fs, rx, ry, psiDeg) {
                    var psi = psiDeg * (Math.PI / 180.0);
                    var xp = (Math.cos(psi) * (x1 - x2)) / 2.0 + (Math.sin(psi) * (y1 - y2)) / 2.0;
                    var yp = (-1 * Math.sin(psi) * (x1 - x2)) / 2.0 +
                        (Math.cos(psi) * (y1 - y2)) / 2.0;
                    var lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
                    if (lambda > 1) {
                        rx *= Math.sqrt(lambda);
                        ry *= Math.sqrt(lambda);
                    }
                    var f = Math.sqrt((rx * rx * (ry * ry) - rx * rx * (yp * yp) - ry * ry * (xp * xp)) /
                        (rx * rx * (yp * yp) + ry * ry * (xp * xp)));
                    if (fa === fs) {
                        f *= -1;
                    }
                    if (isNaN(f)) {
                        f = 0;
                    }
                    var cxp = (f * rx * yp) / ry;
                    var cyp = (f * -ry * xp) / rx;
                    var cx = (x1 + x2) / 2.0 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
                    var cy = (y1 + y2) / 2.0 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;
                    var vMag = function (v) {
                        return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
                    };
                    var vRatio = function (u, v) {
                        return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
                    };
                    var vAngle = function (u, v) {
                        return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
                    };
                    var theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
                    var u = [(xp - cxp) / rx, (yp - cyp) / ry];
                    var v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
                    var dTheta = vAngle(u, v);
                    if (vRatio(u, v) <= -1) {
                        dTheta = Math.PI;
                    }
                    if (vRatio(u, v) >= 1) {
                        dTheta = 0;
                    }
                    if (fs === 0 && dTheta > 0) {
                        dTheta = dTheta - 2 * Math.PI;
                    }
                    if (fs === 1 && dTheta < 0) {
                        dTheta = dTheta + 2 * Math.PI;
                    }
                    return [cx, cy, rx, ry, theta, dTheta, psi, fs];
                }
            }
            Path.prototype.className = 'Path';
            Path.prototype._attrsAffectingSize = ['data'];
            _registerNode(Path);
            Factory.addGetterSetter(Path, 'data');

            class Arrow extends Line$2 {
                _sceneFunc(ctx) {
                    super._sceneFunc(ctx);
                    var PI2 = Math.PI * 2;
                    var points = this.points();
                    var tp = points;
                    var fromTension = this.tension() !== 0 && points.length > 4;
                    if (fromTension) {
                        tp = this.getTensionPoints();
                    }
                    var length = this.pointerLength();
                    var n = points.length;
                    var dx, dy;
                    if (fromTension) {
                        const lp = [
                            tp[tp.length - 4],
                            tp[tp.length - 3],
                            tp[tp.length - 2],
                            tp[tp.length - 1],
                            points[n - 2],
                            points[n - 1],
                        ];
                        const lastLength = Path.calcLength(tp[tp.length - 4], tp[tp.length - 3], 'C', lp);
                        const previous = Path.getPointOnQuadraticBezier(Math.min(1, 1 - length / lastLength), lp[0], lp[1], lp[2], lp[3], lp[4], lp[5]);
                        dx = points[n - 2] - previous.x;
                        dy = points[n - 1] - previous.y;
                    }
                    else {
                        dx = points[n - 2] - points[n - 4];
                        dy = points[n - 1] - points[n - 3];
                    }
                    var radians = (Math.atan2(dy, dx) + PI2) % PI2;
                    var width = this.pointerWidth();
                    if (this.pointerAtEnding()) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.translate(points[n - 2], points[n - 1]);
                        ctx.rotate(radians);
                        ctx.moveTo(0, 0);
                        ctx.lineTo(-length, width / 2);
                        ctx.lineTo(-length, -width / 2);
                        ctx.closePath();
                        ctx.restore();
                        this.__fillStroke(ctx);
                    }
                    if (this.pointerAtBeginning()) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.translate(points[0], points[1]);
                        if (fromTension) {
                            dx = (tp[0] + tp[2]) / 2 - points[0];
                            dy = (tp[1] + tp[3]) / 2 - points[1];
                        }
                        else {
                            dx = points[2] - points[0];
                            dy = points[3] - points[1];
                        }
                        ctx.rotate((Math.atan2(-dy, -dx) + PI2) % PI2);
                        ctx.moveTo(0, 0);
                        ctx.lineTo(-length, width / 2);
                        ctx.lineTo(-length, -width / 2);
                        ctx.closePath();
                        ctx.restore();
                        this.__fillStroke(ctx);
                    }
                }
                __fillStroke(ctx) {
                    var isDashEnabled = this.dashEnabled();
                    if (isDashEnabled) {
                        this.attrs.dashEnabled = false;
                        ctx.setLineDash([]);
                    }
                    ctx.fillStrokeShape(this);
                    if (isDashEnabled) {
                        this.attrs.dashEnabled = true;
                    }
                }
                getSelfRect() {
                    const lineRect = super.getSelfRect();
                    const offset = this.pointerWidth() / 2;
                    return {
                        x: lineRect.x - offset,
                        y: lineRect.y - offset,
                        width: lineRect.width + offset * 2,
                        height: lineRect.height + offset * 2,
                    };
                }
            }
            Arrow.prototype.className = 'Arrow';
            _registerNode(Arrow);
            Factory.addGetterSetter(Arrow, 'pointerLength', 10, getNumberValidator());
            Factory.addGetterSetter(Arrow, 'pointerWidth', 10, getNumberValidator());
            Factory.addGetterSetter(Arrow, 'pointerAtBeginning', false);
            Factory.addGetterSetter(Arrow, 'pointerAtEnding', true);

            class Circle extends Shape {
                _sceneFunc(context) {
                    context.beginPath();
                    context.arc(0, 0, this.attrs.radius || 0, 0, Math.PI * 2, false);
                    context.closePath();
                    context.fillStrokeShape(this);
                }
                getWidth() {
                    return this.radius() * 2;
                }
                getHeight() {
                    return this.radius() * 2;
                }
                setWidth(width) {
                    if (this.radius() !== width / 2) {
                        this.radius(width / 2);
                    }
                }
                setHeight(height) {
                    if (this.radius() !== height / 2) {
                        this.radius(height / 2);
                    }
                }
            }
            Circle.prototype._centroid = true;
            Circle.prototype.className = 'Circle';
            Circle.prototype._attrsAffectingSize = ['radius'];
            _registerNode(Circle);
            Factory.addGetterSetter(Circle, 'radius', 0, getNumberValidator());

            class Ellipse extends Shape {
                _sceneFunc(context) {
                    var rx = this.radiusX(), ry = this.radiusY();
                    context.beginPath();
                    context.save();
                    if (rx !== ry) {
                        context.scale(1, ry / rx);
                    }
                    context.arc(0, 0, rx, 0, Math.PI * 2, false);
                    context.restore();
                    context.closePath();
                    context.fillStrokeShape(this);
                }
                getWidth() {
                    return this.radiusX() * 2;
                }
                getHeight() {
                    return this.radiusY() * 2;
                }
                setWidth(width) {
                    this.radiusX(width / 2);
                }
                setHeight(height) {
                    this.radiusY(height / 2);
                }
            }
            Ellipse.prototype.className = 'Ellipse';
            Ellipse.prototype._centroid = true;
            Ellipse.prototype._attrsAffectingSize = ['radiusX', 'radiusY'];
            _registerNode(Ellipse);
            Factory.addComponentsGetterSetter(Ellipse, 'radius', ['x', 'y']);
            Factory.addGetterSetter(Ellipse, 'radiusX', 0, getNumberValidator());
            Factory.addGetterSetter(Ellipse, 'radiusY', 0, getNumberValidator());

            class Image extends Shape {
                constructor(attrs) {
                    super(attrs);
                    this.on('imageChange.konva', () => {
                        this._setImageLoad();
                    });
                    this._setImageLoad();
                }
                _setImageLoad() {
                    const image = this.image();
                    if (image && image.complete) {
                        return;
                    }
                    if (image && image.readyState === 4) {
                        return;
                    }
                    if (image && image['addEventListener']) {
                        image['addEventListener']('load', () => {
                            this._requestDraw();
                        });
                    }
                }
                _useBufferCanvas() {
                    return super._useBufferCanvas(true);
                }
                _sceneFunc(context) {
                    const width = this.getWidth();
                    const height = this.getHeight();
                    const cornerRadius = this.cornerRadius();
                    const image = this.attrs.image;
                    let params;
                    if (image) {
                        const cropWidth = this.attrs.cropWidth;
                        const cropHeight = this.attrs.cropHeight;
                        if (cropWidth && cropHeight) {
                            params = [
                                image,
                                this.cropX(),
                                this.cropY(),
                                cropWidth,
                                cropHeight,
                                0,
                                0,
                                width,
                                height,
                            ];
                        }
                        else {
                            params = [image, 0, 0, width, height];
                        }
                    }
                    if (this.hasFill() || this.hasStroke() || cornerRadius) {
                        context.beginPath();
                        cornerRadius
                            ? Util.drawRoundedRectPath(context, width, height, cornerRadius)
                            : context.rect(0, 0, width, height);
                        context.closePath();
                        context.fillStrokeShape(this);
                    }
                    if (image) {
                        if (cornerRadius) {
                            context.clip();
                        }
                        context.drawImage.apply(context, params);
                    }
                }
                _hitFunc(context) {
                    var width = this.width(), height = this.height(), cornerRadius = this.cornerRadius();
                    context.beginPath();
                    if (!cornerRadius) {
                        context.rect(0, 0, width, height);
                    }
                    else {
                        Util.drawRoundedRectPath(context, width, height, cornerRadius);
                    }
                    context.closePath();
                    context.fillStrokeShape(this);
                }
                getWidth() {
                    var _a, _b;
                    return (_a = this.attrs.width) !== null && _a !== void 0 ? _a : (_b = this.image()) === null || _b === void 0 ? void 0 : _b.width;
                }
                getHeight() {
                    var _a, _b;
                    return (_a = this.attrs.height) !== null && _a !== void 0 ? _a : (_b = this.image()) === null || _b === void 0 ? void 0 : _b.height;
                }
                static fromURL(url, callback, onError = null) {
                    var img = Util.createImageElement();
                    img.onload = function () {
                        var image = new Image({
                            image: img,
                        });
                        callback(image);
                    };
                    img.onerror = onError;
                    img.crossOrigin = 'Anonymous';
                    img.src = url;
                }
            }
            Image.prototype.className = 'Image';
            _registerNode(Image);
            Factory.addGetterSetter(Image, 'cornerRadius', 0, getNumberOrArrayOfNumbersValidator(4));
            Factory.addGetterSetter(Image, 'image');
            Factory.addComponentsGetterSetter(Image, 'crop', ['x', 'y', 'width', 'height']);
            Factory.addGetterSetter(Image, 'cropX', 0, getNumberValidator());
            Factory.addGetterSetter(Image, 'cropY', 0, getNumberValidator());
            Factory.addGetterSetter(Image, 'cropWidth', 0, getNumberValidator());
            Factory.addGetterSetter(Image, 'cropHeight', 0, getNumberValidator());

            var ATTR_CHANGE_LIST$2 = [
                'fontFamily',
                'fontSize',
                'fontStyle',
                'padding',
                'lineHeight',
                'text',
                'width',
                'height',
                'pointerDirection',
                'pointerWidth',
                'pointerHeight',
            ], CHANGE_KONVA$1 = 'Change.konva', NONE$1 = 'none', UP = 'up', RIGHT$1 = 'right', DOWN = 'down', LEFT$1 = 'left', attrChangeListLen$1 = ATTR_CHANGE_LIST$2.length;
            class Label extends Group$2 {
                constructor(config) {
                    super(config);
                    this.on('add.konva', function (evt) {
                        this._addListeners(evt.child);
                        this._sync();
                    });
                }
                getText() {
                    return this.find('Text')[0];
                }
                getTag() {
                    return this.find('Tag')[0];
                }
                _addListeners(text) {
                    var that = this, n;
                    var func = function () {
                        that._sync();
                    };
                    for (n = 0; n < attrChangeListLen$1; n++) {
                        text.on(ATTR_CHANGE_LIST$2[n] + CHANGE_KONVA$1, func);
                    }
                }
                getWidth() {
                    return this.getText().width();
                }
                getHeight() {
                    return this.getText().height();
                }
                _sync() {
                    var text = this.getText(), tag = this.getTag(), width, height, pointerDirection, pointerWidth, x, y, pointerHeight;
                    if (text && tag) {
                        width = text.width();
                        height = text.height();
                        pointerDirection = tag.pointerDirection();
                        pointerWidth = tag.pointerWidth();
                        pointerHeight = tag.pointerHeight();
                        x = 0;
                        y = 0;
                        switch (pointerDirection) {
                            case UP:
                                x = width / 2;
                                y = -1 * pointerHeight;
                                break;
                            case RIGHT$1:
                                x = width + pointerWidth;
                                y = height / 2;
                                break;
                            case DOWN:
                                x = width / 2;
                                y = height + pointerHeight;
                                break;
                            case LEFT$1:
                                x = -1 * pointerWidth;
                                y = height / 2;
                                break;
                        }
                        tag.setAttrs({
                            x: -1 * x,
                            y: -1 * y,
                            width: width,
                            height: height,
                        });
                        text.setAttrs({
                            x: -1 * x,
                            y: -1 * y,
                        });
                    }
                }
            }
            Label.prototype.className = 'Label';
            _registerNode(Label);
            class Tag extends Shape {
                _sceneFunc(context) {
                    var width = this.width(), height = this.height(), pointerDirection = this.pointerDirection(), pointerWidth = this.pointerWidth(), pointerHeight = this.pointerHeight(), cornerRadius = this.cornerRadius();
                    let topLeft = 0;
                    let topRight = 0;
                    let bottomLeft = 0;
                    let bottomRight = 0;
                    if (typeof cornerRadius === 'number') {
                        topLeft =
                            topRight =
                                bottomLeft =
                                    bottomRight =
                                        Math.min(cornerRadius, width / 2, height / 2);
                    }
                    else {
                        topLeft = Math.min(cornerRadius[0] || 0, width / 2, height / 2);
                        topRight = Math.min(cornerRadius[1] || 0, width / 2, height / 2);
                        bottomRight = Math.min(cornerRadius[2] || 0, width / 2, height / 2);
                        bottomLeft = Math.min(cornerRadius[3] || 0, width / 2, height / 2);
                    }
                    context.beginPath();
                    context.moveTo(topLeft, 0);
                    if (pointerDirection === UP) {
                        context.lineTo((width - pointerWidth) / 2, 0);
                        context.lineTo(width / 2, -1 * pointerHeight);
                        context.lineTo((width + pointerWidth) / 2, 0);
                    }
                    context.lineTo(width - topRight, 0);
                    context.arc(width - topRight, topRight, topRight, (Math.PI * 3) / 2, 0, false);
                    if (pointerDirection === RIGHT$1) {
                        context.lineTo(width, (height - pointerHeight) / 2);
                        context.lineTo(width + pointerWidth, height / 2);
                        context.lineTo(width, (height + pointerHeight) / 2);
                    }
                    context.lineTo(width, height - bottomRight);
                    context.arc(width - bottomRight, height - bottomRight, bottomRight, 0, Math.PI / 2, false);
                    if (pointerDirection === DOWN) {
                        context.lineTo((width + pointerWidth) / 2, height);
                        context.lineTo(width / 2, height + pointerHeight);
                        context.lineTo((width - pointerWidth) / 2, height);
                    }
                    context.lineTo(bottomLeft, height);
                    context.arc(bottomLeft, height - bottomLeft, bottomLeft, Math.PI / 2, Math.PI, false);
                    if (pointerDirection === LEFT$1) {
                        context.lineTo(0, (height + pointerHeight) / 2);
                        context.lineTo(-1 * pointerWidth, height / 2);
                        context.lineTo(0, (height - pointerHeight) / 2);
                    }
                    context.lineTo(0, topLeft);
                    context.arc(topLeft, topLeft, topLeft, Math.PI, (Math.PI * 3) / 2, false);
                    context.closePath();
                    context.fillStrokeShape(this);
                }
                getSelfRect() {
                    var x = 0, y = 0, pointerWidth = this.pointerWidth(), pointerHeight = this.pointerHeight(), direction = this.pointerDirection(), width = this.width(), height = this.height();
                    if (direction === UP) {
                        y -= pointerHeight;
                        height += pointerHeight;
                    }
                    else if (direction === DOWN) {
                        height += pointerHeight;
                    }
                    else if (direction === LEFT$1) {
                        x -= pointerWidth * 1.5;
                        width += pointerWidth;
                    }
                    else if (direction === RIGHT$1) {
                        width += pointerWidth * 1.5;
                    }
                    return {
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                    };
                }
            }
            Tag.prototype.className = 'Tag';
            _registerNode(Tag);
            Factory.addGetterSetter(Tag, 'pointerDirection', NONE$1);
            Factory.addGetterSetter(Tag, 'pointerWidth', 0, getNumberValidator());
            Factory.addGetterSetter(Tag, 'pointerHeight', 0, getNumberValidator());
            Factory.addGetterSetter(Tag, 'cornerRadius', 0, getNumberOrArrayOfNumbersValidator(4));

            class Rect$3 extends Shape {
                _sceneFunc(context) {
                    var cornerRadius = this.cornerRadius(), width = this.width(), height = this.height();
                    context.beginPath();
                    if (!cornerRadius) {
                        context.rect(0, 0, width, height);
                    }
                    else {
                        Util.drawRoundedRectPath(context, width, height, cornerRadius);
                    }
                    context.closePath();
                    context.fillStrokeShape(this);
                }
            }
            Rect$3.prototype.className = 'Rect';
            _registerNode(Rect$3);
            Factory.addGetterSetter(Rect$3, 'cornerRadius', 0, getNumberOrArrayOfNumbersValidator(4));

            class RegularPolygon extends Shape {
                _sceneFunc(context) {
                    const points = this._getPoints();
                    context.beginPath();
                    context.moveTo(points[0].x, points[0].y);
                    for (var n = 1; n < points.length; n++) {
                        context.lineTo(points[n].x, points[n].y);
                    }
                    context.closePath();
                    context.fillStrokeShape(this);
                }
                _getPoints() {
                    const sides = this.attrs.sides;
                    const radius = this.attrs.radius || 0;
                    const points = [];
                    for (var n = 0; n < sides; n++) {
                        points.push({
                            x: radius * Math.sin((n * 2 * Math.PI) / sides),
                            y: -1 * radius * Math.cos((n * 2 * Math.PI) / sides),
                        });
                    }
                    return points;
                }
                getSelfRect() {
                    const points = this._getPoints();
                    var minX = points[0].x;
                    var maxX = points[0].y;
                    var minY = points[0].x;
                    var maxY = points[0].y;
                    points.forEach((point) => {
                        minX = Math.min(minX, point.x);
                        maxX = Math.max(maxX, point.x);
                        minY = Math.min(minY, point.y);
                        maxY = Math.max(maxY, point.y);
                    });
                    return {
                        x: minX,
                        y: minY,
                        width: maxX - minX,
                        height: maxY - minY,
                    };
                }
                getWidth() {
                    return this.radius() * 2;
                }
                getHeight() {
                    return this.radius() * 2;
                }
                setWidth(width) {
                    this.radius(width / 2);
                }
                setHeight(height) {
                    this.radius(height / 2);
                }
            }
            RegularPolygon.prototype.className = 'RegularPolygon';
            RegularPolygon.prototype._centroid = true;
            RegularPolygon.prototype._attrsAffectingSize = ['radius'];
            _registerNode(RegularPolygon);
            Factory.addGetterSetter(RegularPolygon, 'radius', 0, getNumberValidator());
            Factory.addGetterSetter(RegularPolygon, 'sides', 0, getNumberValidator());

            var PIx2 = Math.PI * 2;
            class Ring extends Shape {
                _sceneFunc(context) {
                    context.beginPath();
                    context.arc(0, 0, this.innerRadius(), 0, PIx2, false);
                    context.moveTo(this.outerRadius(), 0);
                    context.arc(0, 0, this.outerRadius(), PIx2, 0, true);
                    context.closePath();
                    context.fillStrokeShape(this);
                }
                getWidth() {
                    return this.outerRadius() * 2;
                }
                getHeight() {
                    return this.outerRadius() * 2;
                }
                setWidth(width) {
                    this.outerRadius(width / 2);
                }
                setHeight(height) {
                    this.outerRadius(height / 2);
                }
            }
            Ring.prototype.className = 'Ring';
            Ring.prototype._centroid = true;
            Ring.prototype._attrsAffectingSize = ['innerRadius', 'outerRadius'];
            _registerNode(Ring);
            Factory.addGetterSetter(Ring, 'innerRadius', 0, getNumberValidator());
            Factory.addGetterSetter(Ring, 'outerRadius', 0, getNumberValidator());

            class Sprite extends Shape {
                constructor(config) {
                    super(config);
                    this._updated = true;
                    this.anim = new Animation(() => {
                        var updated = this._updated;
                        this._updated = false;
                        return updated;
                    });
                    this.on('animationChange.konva', function () {
                        this.frameIndex(0);
                    });
                    this.on('frameIndexChange.konva', function () {
                        this._updated = true;
                    });
                    this.on('frameRateChange.konva', function () {
                        if (!this.anim.isRunning()) {
                            return;
                        }
                        clearInterval(this.interval);
                        this._setInterval();
                    });
                }
                _sceneFunc(context) {
                    var anim = this.animation(), index = this.frameIndex(), ix4 = index * 4, set = this.animations()[anim], offsets = this.frameOffsets(), x = set[ix4 + 0], y = set[ix4 + 1], width = set[ix4 + 2], height = set[ix4 + 3], image = this.image();
                    if (this.hasFill() || this.hasStroke()) {
                        context.beginPath();
                        context.rect(0, 0, width, height);
                        context.closePath();
                        context.fillStrokeShape(this);
                    }
                    if (image) {
                        if (offsets) {
                            var offset = offsets[anim], ix2 = index * 2;
                            context.drawImage(image, x, y, width, height, offset[ix2 + 0], offset[ix2 + 1], width, height);
                        }
                        else {
                            context.drawImage(image, x, y, width, height, 0, 0, width, height);
                        }
                    }
                }
                _hitFunc(context) {
                    var anim = this.animation(), index = this.frameIndex(), ix4 = index * 4, set = this.animations()[anim], offsets = this.frameOffsets(), width = set[ix4 + 2], height = set[ix4 + 3];
                    context.beginPath();
                    if (offsets) {
                        var offset = offsets[anim];
                        var ix2 = index * 2;
                        context.rect(offset[ix2 + 0], offset[ix2 + 1], width, height);
                    }
                    else {
                        context.rect(0, 0, width, height);
                    }
                    context.closePath();
                    context.fillShape(this);
                }
                _useBufferCanvas() {
                    return super._useBufferCanvas(true);
                }
                _setInterval() {
                    var that = this;
                    this.interval = setInterval(function () {
                        that._updateIndex();
                    }, 1000 / this.frameRate());
                }
                start() {
                    if (this.isRunning()) {
                        return;
                    }
                    var layer = this.getLayer();
                    this.anim.setLayers(layer);
                    this._setInterval();
                    this.anim.start();
                }
                stop() {
                    this.anim.stop();
                    clearInterval(this.interval);
                }
                isRunning() {
                    return this.anim.isRunning();
                }
                _updateIndex() {
                    var index = this.frameIndex(), animation = this.animation(), animations = this.animations(), anim = animations[animation], len = anim.length / 4;
                    if (index < len - 1) {
                        this.frameIndex(index + 1);
                    }
                    else {
                        this.frameIndex(0);
                    }
                }
            }
            Sprite.prototype.className = 'Sprite';
            _registerNode(Sprite);
            Factory.addGetterSetter(Sprite, 'animation');
            Factory.addGetterSetter(Sprite, 'animations');
            Factory.addGetterSetter(Sprite, 'frameOffsets');
            Factory.addGetterSetter(Sprite, 'image');
            Factory.addGetterSetter(Sprite, 'frameIndex', 0, getNumberValidator());
            Factory.addGetterSetter(Sprite, 'frameRate', 17, getNumberValidator());
            Factory.backCompat(Sprite, {
                index: 'frameIndex',
                getIndex: 'getFrameIndex',
                setIndex: 'setFrameIndex',
            });

            class Star extends Shape {
                _sceneFunc(context) {
                    var innerRadius = this.innerRadius(), outerRadius = this.outerRadius(), numPoints = this.numPoints();
                    context.beginPath();
                    context.moveTo(0, 0 - outerRadius);
                    for (var n = 1; n < numPoints * 2; n++) {
                        var radius = n % 2 === 0 ? outerRadius : innerRadius;
                        var x = radius * Math.sin((n * Math.PI) / numPoints);
                        var y = -1 * radius * Math.cos((n * Math.PI) / numPoints);
                        context.lineTo(x, y);
                    }
                    context.closePath();
                    context.fillStrokeShape(this);
                }
                getWidth() {
                    return this.outerRadius() * 2;
                }
                getHeight() {
                    return this.outerRadius() * 2;
                }
                setWidth(width) {
                    this.outerRadius(width / 2);
                }
                setHeight(height) {
                    this.outerRadius(height / 2);
                }
            }
            Star.prototype.className = 'Star';
            Star.prototype._centroid = true;
            Star.prototype._attrsAffectingSize = ['innerRadius', 'outerRadius'];
            _registerNode(Star);
            Factory.addGetterSetter(Star, 'numPoints', 5, getNumberValidator());
            Factory.addGetterSetter(Star, 'innerRadius', 0, getNumberValidator());
            Factory.addGetterSetter(Star, 'outerRadius', 0, getNumberValidator());

            function stringToArray(string) {
                return Array.from(string);
            }
            var AUTO = 'auto', CENTER = 'center', JUSTIFY = 'justify', CHANGE_KONVA = 'Change.konva', CONTEXT_2D = '2d', DASH = '-', LEFT = 'left', TEXT = 'text', TEXT_UPPER = 'Text', TOP = 'top', BOTTOM = 'bottom', MIDDLE = 'middle', NORMAL$1 = 'normal', PX_SPACE = 'px ', SPACE = ' ', RIGHT = 'right', WORD = 'word', CHAR = 'char', NONE = 'none', ELLIPSIS = '…', ATTR_CHANGE_LIST$1 = [
                'fontFamily',
                'fontSize',
                'fontStyle',
                'fontVariant',
                'padding',
                'align',
                'verticalAlign',
                'lineHeight',
                'text',
                'width',
                'height',
                'wrap',
                'ellipsis',
                'letterSpacing',
            ], attrChangeListLen = ATTR_CHANGE_LIST$1.length;
            function normalizeFontFamily(fontFamily) {
                return fontFamily
                    .split(',')
                    .map((family) => {
                    family = family.trim();
                    const hasSpace = family.indexOf(' ') >= 0;
                    const hasQuotes = family.indexOf('"') >= 0 || family.indexOf("'") >= 0;
                    if (hasSpace && !hasQuotes) {
                        family = `"${family}"`;
                    }
                    return family;
                })
                    .join(', ');
            }
            var dummyContext;
            function getDummyContext() {
                if (dummyContext) {
                    return dummyContext;
                }
                dummyContext = Util.createCanvasElement().getContext(CONTEXT_2D);
                return dummyContext;
            }
            function _fillFunc$1(context) {
                context.fillText(this._partialText, this._partialTextX, this._partialTextY);
            }
            function _strokeFunc$1(context) {
                context.strokeText(this._partialText, this._partialTextX, this._partialTextY);
            }
            function checkDefaultFill(config) {
                config = config || {};
                if (!config.fillLinearGradientColorStops &&
                    !config.fillRadialGradientColorStops &&
                    !config.fillPatternImage) {
                    config.fill = config.fill || 'black';
                }
                return config;
            }
            class Text extends Shape {
                constructor(config) {
                    super(checkDefaultFill(config));
                    this._partialTextX = 0;
                    this._partialTextY = 0;
                    for (var n = 0; n < attrChangeListLen; n++) {
                        this.on(ATTR_CHANGE_LIST$1[n] + CHANGE_KONVA, this._setTextData);
                    }
                    this._setTextData();
                }
                _sceneFunc(context) {
                    var textArr = this.textArr, textArrLen = textArr.length;
                    if (!this.text()) {
                        return;
                    }
                    var padding = this.padding(), fontSize = this.fontSize(), lineHeightPx = this.lineHeight() * fontSize, verticalAlign = this.verticalAlign(), alignY = 0, align = this.align(), totalWidth = this.getWidth(), letterSpacing = this.letterSpacing(), fill = this.fill(), textDecoration = this.textDecoration(), shouldUnderline = textDecoration.indexOf('underline') !== -1, shouldLineThrough = textDecoration.indexOf('line-through') !== -1, n;
                    var translateY = 0;
                    var translateY = lineHeightPx / 2;
                    var lineTranslateX = 0;
                    var lineTranslateY = 0;
                    context.setAttr('font', this._getContextFont());
                    context.setAttr('textBaseline', MIDDLE);
                    context.setAttr('textAlign', LEFT);
                    if (verticalAlign === MIDDLE) {
                        alignY = (this.getHeight() - textArrLen * lineHeightPx - padding * 2) / 2;
                    }
                    else if (verticalAlign === BOTTOM) {
                        alignY = this.getHeight() - textArrLen * lineHeightPx - padding * 2;
                    }
                    context.translate(padding, alignY + padding);
                    for (n = 0; n < textArrLen; n++) {
                        var lineTranslateX = 0;
                        var lineTranslateY = 0;
                        var obj = textArr[n], text = obj.text, width = obj.width, lastLine = obj.lastInParagraph, spacesNumber, oneWord, lineWidth;
                        context.save();
                        if (align === RIGHT) {
                            lineTranslateX += totalWidth - width - padding * 2;
                        }
                        else if (align === CENTER) {
                            lineTranslateX += (totalWidth - width - padding * 2) / 2;
                        }
                        if (shouldUnderline) {
                            context.save();
                            context.beginPath();
                            context.moveTo(lineTranslateX, translateY + lineTranslateY + Math.round(fontSize / 2));
                            spacesNumber = text.split(' ').length - 1;
                            oneWord = spacesNumber === 0;
                            lineWidth =
                                align === JUSTIFY && !lastLine ? totalWidth - padding * 2 : width;
                            context.lineTo(lineTranslateX + Math.round(lineWidth), translateY + lineTranslateY + Math.round(fontSize / 2));
                            context.lineWidth = fontSize / 15;
                            const gradient = this._getLinearGradient();
                            context.strokeStyle = gradient || fill;
                            context.stroke();
                            context.restore();
                        }
                        if (shouldLineThrough) {
                            context.save();
                            context.beginPath();
                            context.moveTo(lineTranslateX, translateY + lineTranslateY);
                            spacesNumber = text.split(' ').length - 1;
                            oneWord = spacesNumber === 0;
                            lineWidth =
                                align === JUSTIFY && lastLine && !oneWord
                                    ? totalWidth - padding * 2
                                    : width;
                            context.lineTo(lineTranslateX + Math.round(lineWidth), translateY + lineTranslateY);
                            context.lineWidth = fontSize / 15;
                            const gradient = this._getLinearGradient();
                            context.strokeStyle = gradient || fill;
                            context.stroke();
                            context.restore();
                        }
                        if (letterSpacing !== 0 || align === JUSTIFY) {
                            spacesNumber = text.split(' ').length - 1;
                            var array = stringToArray(text);
                            for (var li = 0; li < array.length; li++) {
                                var letter = array[li];
                                if (letter === ' ' && !lastLine && align === JUSTIFY) {
                                    lineTranslateX += (totalWidth - padding * 2 - width) / spacesNumber;
                                }
                                this._partialTextX = lineTranslateX;
                                this._partialTextY = translateY + lineTranslateY;
                                this._partialText = letter;
                                context.fillStrokeShape(this);
                                lineTranslateX += this.measureSize(letter).width + letterSpacing;
                            }
                        }
                        else {
                            this._partialTextX = lineTranslateX;
                            this._partialTextY = translateY + lineTranslateY;
                            this._partialText = text;
                            context.fillStrokeShape(this);
                        }
                        context.restore();
                        if (textArrLen > 1) {
                            translateY += lineHeightPx;
                        }
                    }
                }
                _hitFunc(context) {
                    var width = this.getWidth(), height = this.getHeight();
                    context.beginPath();
                    context.rect(0, 0, width, height);
                    context.closePath();
                    context.fillStrokeShape(this);
                }
                setText(text) {
                    var str = Util._isString(text)
                        ? text
                        : text === null || text === undefined
                            ? ''
                            : text + '';
                    this._setAttr(TEXT, str);
                    return this;
                }
                getWidth() {
                    var isAuto = this.attrs.width === AUTO || this.attrs.width === undefined;
                    return isAuto ? this.getTextWidth() + this.padding() * 2 : this.attrs.width;
                }
                getHeight() {
                    var isAuto = this.attrs.height === AUTO || this.attrs.height === undefined;
                    return isAuto
                        ? this.fontSize() * this.textArr.length * this.lineHeight() +
                            this.padding() * 2
                        : this.attrs.height;
                }
                getTextWidth() {
                    return this.textWidth;
                }
                getTextHeight() {
                    Util.warn('text.getTextHeight() method is deprecated. Use text.height() - for full height and text.fontSize() - for one line height.');
                    return this.textHeight;
                }
                measureSize(text) {
                    var _context = getDummyContext(), fontSize = this.fontSize(), metrics;
                    _context.save();
                    _context.font = this._getContextFont();
                    metrics = _context.measureText(text);
                    _context.restore();
                    return {
                        width: metrics.width,
                        height: fontSize,
                    };
                }
                _getContextFont() {
                    return (this.fontStyle() +
                        SPACE +
                        this.fontVariant() +
                        SPACE +
                        (this.fontSize() + PX_SPACE) +
                        normalizeFontFamily(this.fontFamily()));
                }
                _addTextLine(line) {
                    const align = this.align();
                    if (align === JUSTIFY) {
                        line = line.trim();
                    }
                    var width = this._getTextWidth(line);
                    return this.textArr.push({
                        text: line,
                        width: width,
                        lastInParagraph: false,
                    });
                }
                _getTextWidth(text) {
                    var letterSpacing = this.letterSpacing();
                    var length = text.length;
                    return (getDummyContext().measureText(text).width +
                        (length ? letterSpacing * (length - 1) : 0));
                }
                _setTextData() {
                    var lines = this.text().split('\n'), fontSize = +this.fontSize(), textWidth = 0, lineHeightPx = this.lineHeight() * fontSize, width = this.attrs.width, height = this.attrs.height, fixedWidth = width !== AUTO && width !== undefined, fixedHeight = height !== AUTO && height !== undefined, padding = this.padding(), maxWidth = width - padding * 2, maxHeightPx = height - padding * 2, currentHeightPx = 0, wrap = this.wrap(), shouldWrap = wrap !== NONE, wrapAtWord = wrap !== CHAR && shouldWrap, shouldAddEllipsis = this.ellipsis();
                    this.textArr = [];
                    getDummyContext().font = this._getContextFont();
                    var additionalWidth = shouldAddEllipsis ? this._getTextWidth(ELLIPSIS) : 0;
                    for (var i = 0, max = lines.length; i < max; ++i) {
                        var line = lines[i];
                        var lineWidth = this._getTextWidth(line);
                        if (fixedWidth && lineWidth > maxWidth) {
                            while (line.length > 0) {
                                var low = 0, high = line.length, match = '', matchWidth = 0;
                                while (low < high) {
                                    var mid = (low + high) >>> 1, substr = line.slice(0, mid + 1), substrWidth = this._getTextWidth(substr) + additionalWidth;
                                    if (substrWidth <= maxWidth) {
                                        low = mid + 1;
                                        match = substr;
                                        matchWidth = substrWidth;
                                    }
                                    else {
                                        high = mid;
                                    }
                                }
                                if (match) {
                                    if (wrapAtWord) {
                                        var wrapIndex;
                                        var nextChar = line[match.length];
                                        var nextIsSpaceOrDash = nextChar === SPACE || nextChar === DASH;
                                        if (nextIsSpaceOrDash && matchWidth <= maxWidth) {
                                            wrapIndex = match.length;
                                        }
                                        else {
                                            wrapIndex =
                                                Math.max(match.lastIndexOf(SPACE), match.lastIndexOf(DASH)) +
                                                    1;
                                        }
                                        if (wrapIndex > 0) {
                                            low = wrapIndex;
                                            match = match.slice(0, low);
                                            matchWidth = this._getTextWidth(match);
                                        }
                                    }
                                    match = match.trimRight();
                                    this._addTextLine(match);
                                    textWidth = Math.max(textWidth, matchWidth);
                                    currentHeightPx += lineHeightPx;
                                    var shouldHandleEllipsis = this._shouldHandleEllipsis(currentHeightPx);
                                    if (shouldHandleEllipsis) {
                                        this._tryToAddEllipsisToLastLine();
                                        break;
                                    }
                                    line = line.slice(low);
                                    line = line.trimLeft();
                                    if (line.length > 0) {
                                        lineWidth = this._getTextWidth(line);
                                        if (lineWidth <= maxWidth) {
                                            this._addTextLine(line);
                                            currentHeightPx += lineHeightPx;
                                            textWidth = Math.max(textWidth, lineWidth);
                                            break;
                                        }
                                    }
                                }
                                else {
                                    break;
                                }
                            }
                        }
                        else {
                            this._addTextLine(line);
                            currentHeightPx += lineHeightPx;
                            textWidth = Math.max(textWidth, lineWidth);
                            if (this._shouldHandleEllipsis(currentHeightPx) && i < max - 1) {
                                this._tryToAddEllipsisToLastLine();
                            }
                        }
                        if (this.textArr[this.textArr.length - 1]) {
                            this.textArr[this.textArr.length - 1].lastInParagraph = true;
                        }
                        if (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx) {
                            break;
                        }
                    }
                    this.textHeight = fontSize;
                    this.textWidth = textWidth;
                }
                _shouldHandleEllipsis(currentHeightPx) {
                    var fontSize = +this.fontSize(), lineHeightPx = this.lineHeight() * fontSize, height = this.attrs.height, fixedHeight = height !== AUTO && height !== undefined, padding = this.padding(), maxHeightPx = height - padding * 2, wrap = this.wrap(), shouldWrap = wrap !== NONE;
                    return (!shouldWrap ||
                        (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx));
                }
                _tryToAddEllipsisToLastLine() {
                    var width = this.attrs.width, fixedWidth = width !== AUTO && width !== undefined, padding = this.padding(), maxWidth = width - padding * 2, shouldAddEllipsis = this.ellipsis();
                    var lastLine = this.textArr[this.textArr.length - 1];
                    if (!lastLine || !shouldAddEllipsis) {
                        return;
                    }
                    if (fixedWidth) {
                        var haveSpace = this._getTextWidth(lastLine.text + ELLIPSIS) < maxWidth;
                        if (!haveSpace) {
                            lastLine.text = lastLine.text.slice(0, lastLine.text.length - 3);
                        }
                    }
                    this.textArr.splice(this.textArr.length - 1, 1);
                    this._addTextLine(lastLine.text + ELLIPSIS);
                }
                getStrokeScaleEnabled() {
                    return true;
                }
            }
            Text.prototype._fillFunc = _fillFunc$1;
            Text.prototype._strokeFunc = _strokeFunc$1;
            Text.prototype.className = TEXT_UPPER;
            Text.prototype._attrsAffectingSize = [
                'text',
                'fontSize',
                'padding',
                'wrap',
                'lineHeight',
                'letterSpacing',
            ];
            _registerNode(Text);
            Factory.overWriteSetter(Text, 'width', getNumberOrAutoValidator());
            Factory.overWriteSetter(Text, 'height', getNumberOrAutoValidator());
            Factory.addGetterSetter(Text, 'fontFamily', 'Arial');
            Factory.addGetterSetter(Text, 'fontSize', 12, getNumberValidator());
            Factory.addGetterSetter(Text, 'fontStyle', NORMAL$1);
            Factory.addGetterSetter(Text, 'fontVariant', NORMAL$1);
            Factory.addGetterSetter(Text, 'padding', 0, getNumberValidator());
            Factory.addGetterSetter(Text, 'align', LEFT);
            Factory.addGetterSetter(Text, 'verticalAlign', TOP);
            Factory.addGetterSetter(Text, 'lineHeight', 1, getNumberValidator());
            Factory.addGetterSetter(Text, 'wrap', WORD);
            Factory.addGetterSetter(Text, 'ellipsis', false, getBooleanValidator());
            Factory.addGetterSetter(Text, 'letterSpacing', 0, getNumberValidator());
            Factory.addGetterSetter(Text, 'text', '', getStringValidator());
            Factory.addGetterSetter(Text, 'textDecoration', '');

            var EMPTY_STRING = '', NORMAL = 'normal';
            function _fillFunc(context) {
                context.fillText(this.partialText, 0, 0);
            }
            function _strokeFunc(context) {
                context.strokeText(this.partialText, 0, 0);
            }
            class TextPath extends Shape {
                constructor(config) {
                    super(config);
                    this.dummyCanvas = Util.createCanvasElement();
                    this.dataArray = [];
                    this.dataArray = Path.parsePathData(this.attrs.data);
                    this.on('dataChange.konva', function () {
                        this.dataArray = Path.parsePathData(this.attrs.data);
                        this._setTextData();
                    });
                    this.on('textChange.konva alignChange.konva letterSpacingChange.konva kerningFuncChange.konva fontSizeChange.konva fontFamilyChange.konva', this._setTextData);
                    this._setTextData();
                }
                _sceneFunc(context) {
                    context.setAttr('font', this._getContextFont());
                    context.setAttr('textBaseline', this.textBaseline());
                    context.setAttr('textAlign', 'left');
                    context.save();
                    var textDecoration = this.textDecoration();
                    var fill = this.fill();
                    var fontSize = this.fontSize();
                    var glyphInfo = this.glyphInfo;
                    if (textDecoration === 'underline') {
                        context.beginPath();
                    }
                    for (var i = 0; i < glyphInfo.length; i++) {
                        context.save();
                        var p0 = glyphInfo[i].p0;
                        context.translate(p0.x, p0.y);
                        context.rotate(glyphInfo[i].rotation);
                        this.partialText = glyphInfo[i].text;
                        context.fillStrokeShape(this);
                        if (textDecoration === 'underline') {
                            if (i === 0) {
                                context.moveTo(0, fontSize / 2 + 1);
                            }
                            context.lineTo(fontSize, fontSize / 2 + 1);
                        }
                        context.restore();
                    }
                    if (textDecoration === 'underline') {
                        context.strokeStyle = fill;
                        context.lineWidth = fontSize / 20;
                        context.stroke();
                    }
                    context.restore();
                }
                _hitFunc(context) {
                    context.beginPath();
                    var glyphInfo = this.glyphInfo;
                    if (glyphInfo.length >= 1) {
                        var p0 = glyphInfo[0].p0;
                        context.moveTo(p0.x, p0.y);
                    }
                    for (var i = 0; i < glyphInfo.length; i++) {
                        var p1 = glyphInfo[i].p1;
                        context.lineTo(p1.x, p1.y);
                    }
                    context.setAttr('lineWidth', this.fontSize());
                    context.setAttr('strokeStyle', this.colorKey);
                    context.stroke();
                }
                getTextWidth() {
                    return this.textWidth;
                }
                getTextHeight() {
                    Util.warn('text.getTextHeight() method is deprecated. Use text.height() - for full height and text.fontSize() - for one line height.');
                    return this.textHeight;
                }
                setText(text) {
                    return Text.prototype.setText.call(this, text);
                }
                _getContextFont() {
                    return Text.prototype._getContextFont.call(this);
                }
                _getTextSize(text) {
                    var dummyCanvas = this.dummyCanvas;
                    var _context = dummyCanvas.getContext('2d');
                    _context.save();
                    _context.font = this._getContextFont();
                    var metrics = _context.measureText(text);
                    _context.restore();
                    return {
                        width: metrics.width,
                        height: parseInt(this.attrs.fontSize, 10),
                    };
                }
                _setTextData() {
                    var that = this;
                    var size = this._getTextSize(this.attrs.text);
                    var letterSpacing = this.letterSpacing();
                    var align = this.align();
                    var kerningFunc = this.kerningFunc();
                    this.textWidth = size.width;
                    this.textHeight = size.height;
                    var textFullWidth = Math.max(this.textWidth + ((this.attrs.text || '').length - 1) * letterSpacing, 0);
                    this.glyphInfo = [];
                    var fullPathWidth = 0;
                    for (var l = 0; l < that.dataArray.length; l++) {
                        if (that.dataArray[l].pathLength > 0) {
                            fullPathWidth += that.dataArray[l].pathLength;
                        }
                    }
                    var offset = 0;
                    if (align === 'center') {
                        offset = Math.max(0, fullPathWidth / 2 - textFullWidth / 2);
                    }
                    if (align === 'right') {
                        offset = Math.max(0, fullPathWidth - textFullWidth);
                    }
                    var charArr = stringToArray(this.text());
                    var spacesNumber = this.text().split(' ').length - 1;
                    var p0, p1, pathCmd;
                    var pIndex = -1;
                    var currentT = 0;
                    var getNextPathSegment = function () {
                        currentT = 0;
                        var pathData = that.dataArray;
                        for (var j = pIndex + 1; j < pathData.length; j++) {
                            if (pathData[j].pathLength > 0) {
                                pIndex = j;
                                return pathData[j];
                            }
                            else if (pathData[j].command === 'M') {
                                p0 = {
                                    x: pathData[j].points[0],
                                    y: pathData[j].points[1],
                                };
                            }
                        }
                        return {};
                    };
                    var findSegmentToFitCharacter = function (c) {
                        var glyphWidth = that._getTextSize(c).width + letterSpacing;
                        if (c === ' ' && align === 'justify') {
                            glyphWidth += (fullPathWidth - textFullWidth) / spacesNumber;
                        }
                        var currLen = 0;
                        var attempts = 0;
                        p1 = undefined;
                        while (Math.abs(glyphWidth - currLen) / glyphWidth > 0.01 &&
                            attempts < 20) {
                            attempts++;
                            var cumulativePathLength = currLen;
                            while (pathCmd === undefined) {
                                pathCmd = getNextPathSegment();
                                if (pathCmd &&
                                    cumulativePathLength + pathCmd.pathLength < glyphWidth) {
                                    cumulativePathLength += pathCmd.pathLength;
                                    pathCmd = undefined;
                                }
                            }
                            if (Object.keys(pathCmd).length === 0 || p0 === undefined) {
                                return undefined;
                            }
                            var needNewSegment = false;
                            switch (pathCmd.command) {
                                case 'L':
                                    if (Path.getLineLength(p0.x, p0.y, pathCmd.points[0], pathCmd.points[1]) > glyphWidth) {
                                        p1 = Path.getPointOnLine(glyphWidth, p0.x, p0.y, pathCmd.points[0], pathCmd.points[1], p0.x, p0.y);
                                    }
                                    else {
                                        pathCmd = undefined;
                                    }
                                    break;
                                case 'A':
                                    var start = pathCmd.points[4];
                                    var dTheta = pathCmd.points[5];
                                    var end = pathCmd.points[4] + dTheta;
                                    if (currentT === 0) {
                                        currentT = start + 0.00000001;
                                    }
                                    else if (glyphWidth > currLen) {
                                        currentT += ((Math.PI / 180.0) * dTheta) / Math.abs(dTheta);
                                    }
                                    else {
                                        currentT -= ((Math.PI / 360.0) * dTheta) / Math.abs(dTheta);
                                    }
                                    if ((dTheta < 0 && currentT < end) ||
                                        (dTheta >= 0 && currentT > end)) {
                                        currentT = end;
                                        needNewSegment = true;
                                    }
                                    p1 = Path.getPointOnEllipticalArc(pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3], currentT, pathCmd.points[6]);
                                    break;
                                case 'C':
                                    if (currentT === 0) {
                                        if (glyphWidth > pathCmd.pathLength) {
                                            currentT = 0.00000001;
                                        }
                                        else {
                                            currentT = glyphWidth / pathCmd.pathLength;
                                        }
                                    }
                                    else if (glyphWidth > currLen) {
                                        currentT += (glyphWidth - currLen) / pathCmd.pathLength / 2;
                                    }
                                    else {
                                        currentT = Math.max(currentT - (currLen - glyphWidth) / pathCmd.pathLength / 2, 0);
                                    }
                                    if (currentT > 1.0) {
                                        currentT = 1.0;
                                        needNewSegment = true;
                                    }
                                    p1 = Path.getPointOnCubicBezier(currentT, pathCmd.start.x, pathCmd.start.y, pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3], pathCmd.points[4], pathCmd.points[5]);
                                    break;
                                case 'Q':
                                    if (currentT === 0) {
                                        currentT = glyphWidth / pathCmd.pathLength;
                                    }
                                    else if (glyphWidth > currLen) {
                                        currentT += (glyphWidth - currLen) / pathCmd.pathLength;
                                    }
                                    else {
                                        currentT -= (currLen - glyphWidth) / pathCmd.pathLength;
                                    }
                                    if (currentT > 1.0) {
                                        currentT = 1.0;
                                        needNewSegment = true;
                                    }
                                    p1 = Path.getPointOnQuadraticBezier(currentT, pathCmd.start.x, pathCmd.start.y, pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3]);
                                    break;
                            }
                            if (p1 !== undefined) {
                                currLen = Path.getLineLength(p0.x, p0.y, p1.x, p1.y);
                            }
                            if (needNewSegment) {
                                needNewSegment = false;
                                pathCmd = undefined;
                            }
                        }
                    };
                    var testChar = 'C';
                    var glyphWidth = that._getTextSize(testChar).width + letterSpacing;
                    var lettersInOffset = offset / glyphWidth - 1;
                    for (var k = 0; k < lettersInOffset; k++) {
                        findSegmentToFitCharacter(testChar);
                        if (p0 === undefined || p1 === undefined) {
                            break;
                        }
                        p0 = p1;
                    }
                    for (var i = 0; i < charArr.length; i++) {
                        findSegmentToFitCharacter(charArr[i]);
                        if (p0 === undefined || p1 === undefined) {
                            break;
                        }
                        var width = Path.getLineLength(p0.x, p0.y, p1.x, p1.y);
                        var kern = 0;
                        if (kerningFunc) {
                            try {
                                kern = kerningFunc(charArr[i - 1], charArr[i]) * this.fontSize();
                            }
                            catch (e) {
                                kern = 0;
                            }
                        }
                        p0.x += kern;
                        p1.x += kern;
                        this.textWidth += kern;
                        var midpoint = Path.getPointOnLine(kern + width / 2.0, p0.x, p0.y, p1.x, p1.y);
                        var rotation = Math.atan2(p1.y - p0.y, p1.x - p0.x);
                        this.glyphInfo.push({
                            transposeX: midpoint.x,
                            transposeY: midpoint.y,
                            text: charArr[i],
                            rotation: rotation,
                            p0: p0,
                            p1: p1,
                        });
                        p0 = p1;
                    }
                }
                getSelfRect() {
                    if (!this.glyphInfo.length) {
                        return {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0,
                        };
                    }
                    var points = [];
                    this.glyphInfo.forEach(function (info) {
                        points.push(info.p0.x);
                        points.push(info.p0.y);
                        points.push(info.p1.x);
                        points.push(info.p1.y);
                    });
                    var minX = points[0] || 0;
                    var maxX = points[0] || 0;
                    var minY = points[1] || 0;
                    var maxY = points[1] || 0;
                    var x, y;
                    for (var i = 0; i < points.length / 2; i++) {
                        x = points[i * 2];
                        y = points[i * 2 + 1];
                        minX = Math.min(minX, x);
                        maxX = Math.max(maxX, x);
                        minY = Math.min(minY, y);
                        maxY = Math.max(maxY, y);
                    }
                    var fontSize = this.fontSize();
                    return {
                        x: minX - fontSize / 2,
                        y: minY - fontSize / 2,
                        width: maxX - minX + fontSize,
                        height: maxY - minY + fontSize,
                    };
                }
                destroy() {
                    Util.releaseCanvas(this.dummyCanvas);
                    return super.destroy();
                }
            }
            TextPath.prototype._fillFunc = _fillFunc;
            TextPath.prototype._strokeFunc = _strokeFunc;
            TextPath.prototype._fillFuncHit = _fillFunc;
            TextPath.prototype._strokeFuncHit = _strokeFunc;
            TextPath.prototype.className = 'TextPath';
            TextPath.prototype._attrsAffectingSize = ['text', 'fontSize', 'data'];
            _registerNode(TextPath);
            Factory.addGetterSetter(TextPath, 'data');
            Factory.addGetterSetter(TextPath, 'fontFamily', 'Arial');
            Factory.addGetterSetter(TextPath, 'fontSize', 12, getNumberValidator());
            Factory.addGetterSetter(TextPath, 'fontStyle', NORMAL);
            Factory.addGetterSetter(TextPath, 'align', 'left');
            Factory.addGetterSetter(TextPath, 'letterSpacing', 0, getNumberValidator());
            Factory.addGetterSetter(TextPath, 'textBaseline', 'middle');
            Factory.addGetterSetter(TextPath, 'fontVariant', NORMAL);
            Factory.addGetterSetter(TextPath, 'text', EMPTY_STRING);
            Factory.addGetterSetter(TextPath, 'textDecoration', null);
            Factory.addGetterSetter(TextPath, 'kerningFunc', null);

            var EVENTS_NAME = 'tr-konva';
            var ATTR_CHANGE_LIST = [
                'resizeEnabledChange',
                'rotateAnchorOffsetChange',
                'rotateEnabledChange',
                'enabledAnchorsChange',
                'anchorSizeChange',
                'borderEnabledChange',
                'borderStrokeChange',
                'borderStrokeWidthChange',
                'borderDashChange',
                'anchorStrokeChange',
                'anchorStrokeWidthChange',
                'anchorFillChange',
                'anchorCornerRadiusChange',
                'ignoreStrokeChange',
            ]
                .map((e) => e + `.${EVENTS_NAME}`)
                .join(' ');
            var NODES_RECT = 'nodesRect';
            var TRANSFORM_CHANGE_STR = [
                'widthChange',
                'heightChange',
                'scaleXChange',
                'scaleYChange',
                'skewXChange',
                'skewYChange',
                'rotationChange',
                'offsetXChange',
                'offsetYChange',
                'transformsEnabledChange',
                'strokeWidthChange',
            ];
            var ANGLES = {
                'top-left': -45,
                'top-center': 0,
                'top-right': 45,
                'middle-right': -90,
                'middle-left': 90,
                'bottom-left': -135,
                'bottom-center': 180,
                'bottom-right': 135,
            };
            const TOUCH_DEVICE = 'ontouchstart' in Konva$2._global;
            function getCursor(anchorName, rad) {
                if (anchorName === 'rotater') {
                    return 'crosshair';
                }
                rad += Util.degToRad(ANGLES[anchorName] || 0);
                var angle = ((Util.radToDeg(rad) % 360) + 360) % 360;
                if (Util._inRange(angle, 315 + 22.5, 360) || Util._inRange(angle, 0, 22.5)) {
                    return 'ns-resize';
                }
                else if (Util._inRange(angle, 45 - 22.5, 45 + 22.5)) {
                    return 'nesw-resize';
                }
                else if (Util._inRange(angle, 90 - 22.5, 90 + 22.5)) {
                    return 'ew-resize';
                }
                else if (Util._inRange(angle, 135 - 22.5, 135 + 22.5)) {
                    return 'nwse-resize';
                }
                else if (Util._inRange(angle, 180 - 22.5, 180 + 22.5)) {
                    return 'ns-resize';
                }
                else if (Util._inRange(angle, 225 - 22.5, 225 + 22.5)) {
                    return 'nesw-resize';
                }
                else if (Util._inRange(angle, 270 - 22.5, 270 + 22.5)) {
                    return 'ew-resize';
                }
                else if (Util._inRange(angle, 315 - 22.5, 315 + 22.5)) {
                    return 'nwse-resize';
                }
                else {
                    Util.error('Transformer has unknown angle for cursor detection: ' + angle);
                    return 'pointer';
                }
            }
            var ANCHORS_NAMES = [
                'top-left',
                'top-center',
                'top-right',
                'middle-right',
                'middle-left',
                'bottom-left',
                'bottom-center',
                'bottom-right',
            ];
            var MAX_SAFE_INTEGER = 100000000;
            function getCenter(shape) {
                return {
                    x: shape.x +
                        (shape.width / 2) * Math.cos(shape.rotation) +
                        (shape.height / 2) * Math.sin(-shape.rotation),
                    y: shape.y +
                        (shape.height / 2) * Math.cos(shape.rotation) +
                        (shape.width / 2) * Math.sin(shape.rotation),
                };
            }
            function rotateAroundPoint(shape, angleRad, point) {
                const x = point.x +
                    (shape.x - point.x) * Math.cos(angleRad) -
                    (shape.y - point.y) * Math.sin(angleRad);
                const y = point.y +
                    (shape.x - point.x) * Math.sin(angleRad) +
                    (shape.y - point.y) * Math.cos(angleRad);
                return Object.assign(Object.assign({}, shape), { rotation: shape.rotation + angleRad, x,
                    y });
            }
            function rotateAroundCenter(shape, deltaRad) {
                const center = getCenter(shape);
                return rotateAroundPoint(shape, deltaRad, center);
            }
            function getSnap(snaps, newRotationRad, tol) {
                let snapped = newRotationRad;
                for (let i = 0; i < snaps.length; i++) {
                    const angle = Konva$2.getAngle(snaps[i]);
                    const absDiff = Math.abs(angle - newRotationRad) % (Math.PI * 2);
                    const dif = Math.min(absDiff, Math.PI * 2 - absDiff);
                    if (dif < tol) {
                        snapped = angle;
                    }
                }
                return snapped;
            }
            class Transformer extends Group$2 {
                constructor(config) {
                    super(config);
                    this._transforming = false;
                    this._createElements();
                    this._handleMouseMove = this._handleMouseMove.bind(this);
                    this._handleMouseUp = this._handleMouseUp.bind(this);
                    this.update = this.update.bind(this);
                    this.on(ATTR_CHANGE_LIST, this.update);
                    if (this.getNode()) {
                        this.update();
                    }
                }
                attachTo(node) {
                    this.setNode(node);
                    return this;
                }
                setNode(node) {
                    Util.warn('tr.setNode(shape), tr.node(shape) and tr.attachTo(shape) methods are deprecated. Please use tr.nodes(nodesArray) instead.');
                    return this.setNodes([node]);
                }
                getNode() {
                    return this._nodes && this._nodes[0];
                }
                _getEventNamespace() {
                    return EVENTS_NAME + this._id;
                }
                setNodes(nodes = []) {
                    if (this._nodes && this._nodes.length) {
                        this.detach();
                    }
                    const filteredNodes = nodes.filter((node) => {
                        if (node.isAncestorOf(this)) {
                            Util.error('Konva.Transformer cannot be an a child of the node you are trying to attach');
                            return false;
                        }
                        return true;
                    });
                    this._nodes = nodes = filteredNodes;
                    if (nodes.length === 1 && this.useSingleNodeRotation()) {
                        this.rotation(nodes[0].getAbsoluteRotation());
                    }
                    else {
                        this.rotation(0);
                    }
                    this._nodes.forEach((node) => {
                        const onChange = () => {
                            if (this.nodes().length === 1 && this.useSingleNodeRotation()) {
                                this.rotation(this.nodes()[0].getAbsoluteRotation());
                            }
                            this._resetTransformCache();
                            if (!this._transforming && !this.isDragging()) {
                                this.update();
                            }
                        };
                        const additionalEvents = node._attrsAffectingSize
                            .map((prop) => prop + 'Change.' + this._getEventNamespace())
                            .join(' ');
                        node.on(additionalEvents, onChange);
                        node.on(TRANSFORM_CHANGE_STR.map((e) => e + `.${this._getEventNamespace()}`).join(' '), onChange);
                        node.on(`absoluteTransformChange.${this._getEventNamespace()}`, onChange);
                        this._proxyDrag(node);
                    });
                    this._resetTransformCache();
                    var elementsCreated = !!this.findOne('.top-left');
                    if (elementsCreated) {
                        this.update();
                    }
                    return this;
                }
                _proxyDrag(node) {
                    let lastPos;
                    node.on(`dragstart.${this._getEventNamespace()}`, (e) => {
                        lastPos = node.getAbsolutePosition();
                        if (!this.isDragging() && node !== this.findOne('.back')) {
                            this.startDrag(e, false);
                        }
                    });
                    node.on(`dragmove.${this._getEventNamespace()}`, (e) => {
                        if (!lastPos) {
                            return;
                        }
                        const abs = node.getAbsolutePosition();
                        const dx = abs.x - lastPos.x;
                        const dy = abs.y - lastPos.y;
                        this.nodes().forEach((otherNode) => {
                            if (otherNode === node) {
                                return;
                            }
                            if (otherNode.isDragging()) {
                                return;
                            }
                            const otherAbs = otherNode.getAbsolutePosition();
                            otherNode.setAbsolutePosition({
                                x: otherAbs.x + dx,
                                y: otherAbs.y + dy,
                            });
                            otherNode.startDrag(e);
                        });
                        lastPos = null;
                    });
                }
                getNodes() {
                    return this._nodes || [];
                }
                getActiveAnchor() {
                    return this._movingAnchorName;
                }
                detach() {
                    if (this._nodes) {
                        this._nodes.forEach((node) => {
                            node.off('.' + this._getEventNamespace());
                        });
                    }
                    this._nodes = [];
                    this._resetTransformCache();
                }
                _resetTransformCache() {
                    this._clearCache(NODES_RECT);
                    this._clearCache('transform');
                    this._clearSelfAndDescendantCache('absoluteTransform');
                }
                _getNodeRect() {
                    return this._getCache(NODES_RECT, this.__getNodeRect);
                }
                __getNodeShape(node, rot = this.rotation(), relative) {
                    var rect = node.getClientRect({
                        skipTransform: true,
                        skipShadow: true,
                        skipStroke: this.ignoreStroke(),
                    });
                    var absScale = node.getAbsoluteScale(relative);
                    var absPos = node.getAbsolutePosition(relative);
                    var dx = rect.x * absScale.x - node.offsetX() * absScale.x;
                    var dy = rect.y * absScale.y - node.offsetY() * absScale.y;
                    const rotation = (Konva$2.getAngle(node.getAbsoluteRotation()) + Math.PI * 2) %
                        (Math.PI * 2);
                    const box = {
                        x: absPos.x + dx * Math.cos(rotation) + dy * Math.sin(-rotation),
                        y: absPos.y + dy * Math.cos(rotation) + dx * Math.sin(rotation),
                        width: rect.width * absScale.x,
                        height: rect.height * absScale.y,
                        rotation: rotation,
                    };
                    return rotateAroundPoint(box, -Konva$2.getAngle(rot), {
                        x: 0,
                        y: 0,
                    });
                }
                __getNodeRect() {
                    var node = this.getNode();
                    if (!node) {
                        return {
                            x: -MAX_SAFE_INTEGER,
                            y: -MAX_SAFE_INTEGER,
                            width: 0,
                            height: 0,
                            rotation: 0,
                        };
                    }
                    const totalPoints = [];
                    this.nodes().map((node) => {
                        const box = node.getClientRect({
                            skipTransform: true,
                            skipShadow: true,
                            skipStroke: this.ignoreStroke(),
                        });
                        var points = [
                            { x: box.x, y: box.y },
                            { x: box.x + box.width, y: box.y },
                            { x: box.x + box.width, y: box.y + box.height },
                            { x: box.x, y: box.y + box.height },
                        ];
                        var trans = node.getAbsoluteTransform();
                        points.forEach(function (point) {
                            var transformed = trans.point(point);
                            totalPoints.push(transformed);
                        });
                    });
                    const tr = new Transform();
                    tr.rotate(-Konva$2.getAngle(this.rotation()));
                    var minX, minY, maxX, maxY;
                    totalPoints.forEach(function (point) {
                        var transformed = tr.point(point);
                        if (minX === undefined) {
                            minX = maxX = transformed.x;
                            minY = maxY = transformed.y;
                        }
                        minX = Math.min(minX, transformed.x);
                        minY = Math.min(minY, transformed.y);
                        maxX = Math.max(maxX, transformed.x);
                        maxY = Math.max(maxY, transformed.y);
                    });
                    tr.invert();
                    const p = tr.point({ x: minX, y: minY });
                    return {
                        x: p.x,
                        y: p.y,
                        width: maxX - minX,
                        height: maxY - minY,
                        rotation: Konva$2.getAngle(this.rotation()),
                    };
                }
                getX() {
                    return this._getNodeRect().x;
                }
                getY() {
                    return this._getNodeRect().y;
                }
                getWidth() {
                    return this._getNodeRect().width;
                }
                getHeight() {
                    return this._getNodeRect().height;
                }
                _createElements() {
                    this._createBack();
                    ANCHORS_NAMES.forEach(function (name) {
                        this._createAnchor(name);
                    }.bind(this));
                    this._createAnchor('rotater');
                }
                _createAnchor(name) {
                    var anchor = new Rect$3({
                        stroke: 'rgb(0, 161, 255)',
                        fill: 'white',
                        strokeWidth: 1,
                        name: name + ' _anchor',
                        dragDistance: 0,
                        draggable: true,
                        hitStrokeWidth: TOUCH_DEVICE ? 10 : 'auto',
                    });
                    var self = this;
                    anchor.on('mousedown touchstart', function (e) {
                        self._handleMouseDown(e);
                    });
                    anchor.on('dragstart', (e) => {
                        anchor.stopDrag();
                        e.cancelBubble = true;
                    });
                    anchor.on('dragend', (e) => {
                        e.cancelBubble = true;
                    });
                    anchor.on('mouseenter', () => {
                        var rad = Konva$2.getAngle(this.rotation());
                        var cursor = getCursor(name, rad);
                        anchor.getStage().content &&
                            (anchor.getStage().content.style.cursor = cursor);
                        this._cursorChange = true;
                    });
                    anchor.on('mouseout', () => {
                        anchor.getStage().content &&
                            (anchor.getStage().content.style.cursor = '');
                        this._cursorChange = false;
                    });
                    this.add(anchor);
                }
                _createBack() {
                    var back = new Shape({
                        name: 'back',
                        width: 0,
                        height: 0,
                        draggable: true,
                        sceneFunc(ctx) {
                            var tr = this.getParent();
                            var padding = tr.padding();
                            ctx.beginPath();
                            ctx.rect(-padding, -padding, this.width() + padding * 2, this.height() + padding * 2);
                            ctx.moveTo(this.width() / 2, -padding);
                            if (tr.rotateEnabled()) {
                                ctx.lineTo(this.width() / 2, -tr.rotateAnchorOffset() * Util._sign(this.height()) - padding);
                            }
                            ctx.fillStrokeShape(this);
                        },
                        hitFunc: (ctx, shape) => {
                            if (!this.shouldOverdrawWholeArea()) {
                                return;
                            }
                            var padding = this.padding();
                            ctx.beginPath();
                            ctx.rect(-padding, -padding, shape.width() + padding * 2, shape.height() + padding * 2);
                            ctx.fillStrokeShape(shape);
                        },
                    });
                    this.add(back);
                    this._proxyDrag(back);
                    back.on('dragstart', (e) => {
                        e.cancelBubble = true;
                    });
                    back.on('dragmove', (e) => {
                        e.cancelBubble = true;
                    });
                    back.on('dragend', (e) => {
                        e.cancelBubble = true;
                    });
                    this.on('dragmove', (e) => {
                        this.update();
                    });
                }
                _handleMouseDown(e) {
                    this._movingAnchorName = e.target.name().split(' ')[0];
                    var attrs = this._getNodeRect();
                    var width = attrs.width;
                    var height = attrs.height;
                    var hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
                    this.sin = Math.abs(height / hypotenuse);
                    this.cos = Math.abs(width / hypotenuse);
                    if (typeof window !== 'undefined') {
                        window.addEventListener('mousemove', this._handleMouseMove);
                        window.addEventListener('touchmove', this._handleMouseMove);
                        window.addEventListener('mouseup', this._handleMouseUp, true);
                        window.addEventListener('touchend', this._handleMouseUp, true);
                    }
                    this._transforming = true;
                    var ap = e.target.getAbsolutePosition();
                    var pos = e.target.getStage().getPointerPosition();
                    this._anchorDragOffset = {
                        x: pos.x - ap.x,
                        y: pos.y - ap.y,
                    };
                    this._fire('transformstart', { evt: e.evt, target: this.getNode() });
                    this._nodes.forEach((target) => {
                        target._fire('transformstart', { evt: e.evt, target });
                    });
                }
                _handleMouseMove(e) {
                    var x, y, newHypotenuse;
                    var anchorNode = this.findOne('.' + this._movingAnchorName);
                    var stage = anchorNode.getStage();
                    stage.setPointersPositions(e);
                    const pp = stage.getPointerPosition();
                    let newNodePos = {
                        x: pp.x - this._anchorDragOffset.x,
                        y: pp.y - this._anchorDragOffset.y,
                    };
                    const oldAbs = anchorNode.getAbsolutePosition();
                    if (this.anchorDragBoundFunc()) {
                        newNodePos = this.anchorDragBoundFunc()(oldAbs, newNodePos, e);
                    }
                    anchorNode.setAbsolutePosition(newNodePos);
                    const newAbs = anchorNode.getAbsolutePosition();
                    if (oldAbs.x === newAbs.x && oldAbs.y === newAbs.y) {
                        return;
                    }
                    if (this._movingAnchorName === 'rotater') {
                        var attrs = this._getNodeRect();
                        x = anchorNode.x() - attrs.width / 2;
                        y = -anchorNode.y() + attrs.height / 2;
                        let delta = Math.atan2(-y, x) + Math.PI / 2;
                        if (attrs.height < 0) {
                            delta -= Math.PI;
                        }
                        var oldRotation = Konva$2.getAngle(this.rotation());
                        const newRotation = oldRotation + delta;
                        const tol = Konva$2.getAngle(this.rotationSnapTolerance());
                        const snappedRot = getSnap(this.rotationSnaps(), newRotation, tol);
                        const diff = snappedRot - attrs.rotation;
                        const shape = rotateAroundCenter(attrs, diff);
                        this._fitNodesInto(shape, e);
                        return;
                    }
                    var keepProportion = this.keepRatio() || e.shiftKey;
                    var centeredScaling = this.centeredScaling() || e.altKey;
                    if (this._movingAnchorName === 'top-left') {
                        if (keepProportion) {
                            var comparePoint = centeredScaling
                                ? {
                                    x: this.width() / 2,
                                    y: this.height() / 2,
                                }
                                : {
                                    x: this.findOne('.bottom-right').x(),
                                    y: this.findOne('.bottom-right').y(),
                                };
                            newHypotenuse = Math.sqrt(Math.pow(comparePoint.x - anchorNode.x(), 2) +
                                Math.pow(comparePoint.y - anchorNode.y(), 2));
                            var reverseX = this.findOne('.top-left').x() > comparePoint.x ? -1 : 1;
                            var reverseY = this.findOne('.top-left').y() > comparePoint.y ? -1 : 1;
                            x = newHypotenuse * this.cos * reverseX;
                            y = newHypotenuse * this.sin * reverseY;
                            this.findOne('.top-left').x(comparePoint.x - x);
                            this.findOne('.top-left').y(comparePoint.y - y);
                        }
                    }
                    else if (this._movingAnchorName === 'top-center') {
                        this.findOne('.top-left').y(anchorNode.y());
                    }
                    else if (this._movingAnchorName === 'top-right') {
                        if (keepProportion) {
                            var comparePoint = centeredScaling
                                ? {
                                    x: this.width() / 2,
                                    y: this.height() / 2,
                                }
                                : {
                                    x: this.findOne('.bottom-left').x(),
                                    y: this.findOne('.bottom-left').y(),
                                };
                            newHypotenuse = Math.sqrt(Math.pow(anchorNode.x() - comparePoint.x, 2) +
                                Math.pow(comparePoint.y - anchorNode.y(), 2));
                            var reverseX = this.findOne('.top-right').x() < comparePoint.x ? -1 : 1;
                            var reverseY = this.findOne('.top-right').y() > comparePoint.y ? -1 : 1;
                            x = newHypotenuse * this.cos * reverseX;
                            y = newHypotenuse * this.sin * reverseY;
                            this.findOne('.top-right').x(comparePoint.x + x);
                            this.findOne('.top-right').y(comparePoint.y - y);
                        }
                        var pos = anchorNode.position();
                        this.findOne('.top-left').y(pos.y);
                        this.findOne('.bottom-right').x(pos.x);
                    }
                    else if (this._movingAnchorName === 'middle-left') {
                        this.findOne('.top-left').x(anchorNode.x());
                    }
                    else if (this._movingAnchorName === 'middle-right') {
                        this.findOne('.bottom-right').x(anchorNode.x());
                    }
                    else if (this._movingAnchorName === 'bottom-left') {
                        if (keepProportion) {
                            var comparePoint = centeredScaling
                                ? {
                                    x: this.width() / 2,
                                    y: this.height() / 2,
                                }
                                : {
                                    x: this.findOne('.top-right').x(),
                                    y: this.findOne('.top-right').y(),
                                };
                            newHypotenuse = Math.sqrt(Math.pow(comparePoint.x - anchorNode.x(), 2) +
                                Math.pow(anchorNode.y() - comparePoint.y, 2));
                            var reverseX = comparePoint.x < anchorNode.x() ? -1 : 1;
                            var reverseY = anchorNode.y() < comparePoint.y ? -1 : 1;
                            x = newHypotenuse * this.cos * reverseX;
                            y = newHypotenuse * this.sin * reverseY;
                            anchorNode.x(comparePoint.x - x);
                            anchorNode.y(comparePoint.y + y);
                        }
                        pos = anchorNode.position();
                        this.findOne('.top-left').x(pos.x);
                        this.findOne('.bottom-right').y(pos.y);
                    }
                    else if (this._movingAnchorName === 'bottom-center') {
                        this.findOne('.bottom-right').y(anchorNode.y());
                    }
                    else if (this._movingAnchorName === 'bottom-right') {
                        if (keepProportion) {
                            var comparePoint = centeredScaling
                                ? {
                                    x: this.width() / 2,
                                    y: this.height() / 2,
                                }
                                : {
                                    x: this.findOne('.top-left').x(),
                                    y: this.findOne('.top-left').y(),
                                };
                            newHypotenuse = Math.sqrt(Math.pow(anchorNode.x() - comparePoint.x, 2) +
                                Math.pow(anchorNode.y() - comparePoint.y, 2));
                            var reverseX = this.findOne('.bottom-right').x() < comparePoint.x ? -1 : 1;
                            var reverseY = this.findOne('.bottom-right').y() < comparePoint.y ? -1 : 1;
                            x = newHypotenuse * this.cos * reverseX;
                            y = newHypotenuse * this.sin * reverseY;
                            this.findOne('.bottom-right').x(comparePoint.x + x);
                            this.findOne('.bottom-right').y(comparePoint.y + y);
                        }
                    }
                    else {
                        console.error(new Error('Wrong position argument of selection resizer: ' +
                            this._movingAnchorName));
                    }
                    var centeredScaling = this.centeredScaling() || e.altKey;
                    if (centeredScaling) {
                        var topLeft = this.findOne('.top-left');
                        var bottomRight = this.findOne('.bottom-right');
                        var topOffsetX = topLeft.x();
                        var topOffsetY = topLeft.y();
                        var bottomOffsetX = this.getWidth() - bottomRight.x();
                        var bottomOffsetY = this.getHeight() - bottomRight.y();
                        bottomRight.move({
                            x: -topOffsetX,
                            y: -topOffsetY,
                        });
                        topLeft.move({
                            x: bottomOffsetX,
                            y: bottomOffsetY,
                        });
                    }
                    var absPos = this.findOne('.top-left').getAbsolutePosition();
                    x = absPos.x;
                    y = absPos.y;
                    var width = this.findOne('.bottom-right').x() - this.findOne('.top-left').x();
                    var height = this.findOne('.bottom-right').y() - this.findOne('.top-left').y();
                    this._fitNodesInto({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                        rotation: Konva$2.getAngle(this.rotation()),
                    }, e);
                }
                _handleMouseUp(e) {
                    this._removeEvents(e);
                }
                getAbsoluteTransform() {
                    return this.getTransform();
                }
                _removeEvents(e) {
                    if (this._transforming) {
                        this._transforming = false;
                        if (typeof window !== 'undefined') {
                            window.removeEventListener('mousemove', this._handleMouseMove);
                            window.removeEventListener('touchmove', this._handleMouseMove);
                            window.removeEventListener('mouseup', this._handleMouseUp, true);
                            window.removeEventListener('touchend', this._handleMouseUp, true);
                        }
                        var node = this.getNode();
                        this._fire('transformend', { evt: e, target: node });
                        if (node) {
                            this._nodes.forEach((target) => {
                                target._fire('transformend', { evt: e, target });
                            });
                        }
                        this._movingAnchorName = null;
                    }
                }
                _fitNodesInto(newAttrs, evt) {
                    var oldAttrs = this._getNodeRect();
                    const minSize = 1;
                    if (Util._inRange(newAttrs.width, -this.padding() * 2 - minSize, minSize)) {
                        this.update();
                        return;
                    }
                    if (Util._inRange(newAttrs.height, -this.padding() * 2 - minSize, minSize)) {
                        this.update();
                        return;
                    }
                    const allowNegativeScale = this.flipEnabled();
                    var t = new Transform();
                    t.rotate(Konva$2.getAngle(this.rotation()));
                    if (this._movingAnchorName &&
                        newAttrs.width < 0 &&
                        this._movingAnchorName.indexOf('left') >= 0) {
                        const offset = t.point({
                            x: -this.padding() * 2,
                            y: 0,
                        });
                        newAttrs.x += offset.x;
                        newAttrs.y += offset.y;
                        newAttrs.width += this.padding() * 2;
                        this._movingAnchorName = this._movingAnchorName.replace('left', 'right');
                        this._anchorDragOffset.x -= offset.x;
                        this._anchorDragOffset.y -= offset.y;
                        if (!allowNegativeScale) {
                            this.update();
                            return;
                        }
                    }
                    else if (this._movingAnchorName &&
                        newAttrs.width < 0 &&
                        this._movingAnchorName.indexOf('right') >= 0) {
                        const offset = t.point({
                            x: this.padding() * 2,
                            y: 0,
                        });
                        this._movingAnchorName = this._movingAnchorName.replace('right', 'left');
                        this._anchorDragOffset.x -= offset.x;
                        this._anchorDragOffset.y -= offset.y;
                        newAttrs.width += this.padding() * 2;
                        if (!allowNegativeScale) {
                            this.update();
                            return;
                        }
                    }
                    if (this._movingAnchorName &&
                        newAttrs.height < 0 &&
                        this._movingAnchorName.indexOf('top') >= 0) {
                        const offset = t.point({
                            x: 0,
                            y: -this.padding() * 2,
                        });
                        newAttrs.x += offset.x;
                        newAttrs.y += offset.y;
                        this._movingAnchorName = this._movingAnchorName.replace('top', 'bottom');
                        this._anchorDragOffset.x -= offset.x;
                        this._anchorDragOffset.y -= offset.y;
                        newAttrs.height += this.padding() * 2;
                        if (!allowNegativeScale) {
                            this.update();
                            return;
                        }
                    }
                    else if (this._movingAnchorName &&
                        newAttrs.height < 0 &&
                        this._movingAnchorName.indexOf('bottom') >= 0) {
                        const offset = t.point({
                            x: 0,
                            y: this.padding() * 2,
                        });
                        this._movingAnchorName = this._movingAnchorName.replace('bottom', 'top');
                        this._anchorDragOffset.x -= offset.x;
                        this._anchorDragOffset.y -= offset.y;
                        newAttrs.height += this.padding() * 2;
                        if (!allowNegativeScale) {
                            this.update();
                            return;
                        }
                    }
                    if (this.boundBoxFunc()) {
                        const bounded = this.boundBoxFunc()(oldAttrs, newAttrs);
                        if (bounded) {
                            newAttrs = bounded;
                        }
                        else {
                            Util.warn('boundBoxFunc returned falsy. You should return new bound rect from it!');
                        }
                    }
                    const baseSize = 10000000;
                    const oldTr = new Transform();
                    oldTr.translate(oldAttrs.x, oldAttrs.y);
                    oldTr.rotate(oldAttrs.rotation);
                    oldTr.scale(oldAttrs.width / baseSize, oldAttrs.height / baseSize);
                    const newTr = new Transform();
                    newTr.translate(newAttrs.x, newAttrs.y);
                    newTr.rotate(newAttrs.rotation);
                    newTr.scale(newAttrs.width / baseSize, newAttrs.height / baseSize);
                    const delta = newTr.multiply(oldTr.invert());
                    this._nodes.forEach((node) => {
                        var _a;
                        const parentTransform = node.getParent().getAbsoluteTransform();
                        const localTransform = node.getTransform().copy();
                        localTransform.translate(node.offsetX(), node.offsetY());
                        const newLocalTransform = new Transform();
                        newLocalTransform
                            .multiply(parentTransform.copy().invert())
                            .multiply(delta)
                            .multiply(parentTransform)
                            .multiply(localTransform);
                        const attrs = newLocalTransform.decompose();
                        node.setAttrs(attrs);
                        this._fire('transform', { evt: evt, target: node });
                        node._fire('transform', { evt: evt, target: node });
                        (_a = node.getLayer()) === null || _a === void 0 ? void 0 : _a.batchDraw();
                    });
                    this.rotation(Util._getRotation(newAttrs.rotation));
                    this._resetTransformCache();
                    this.update();
                    this.getLayer().batchDraw();
                }
                forceUpdate() {
                    this._resetTransformCache();
                    this.update();
                }
                _batchChangeChild(selector, attrs) {
                    const anchor = this.findOne(selector);
                    anchor.setAttrs(attrs);
                }
                update() {
                    var _a;
                    var attrs = this._getNodeRect();
                    this.rotation(Util._getRotation(attrs.rotation));
                    var width = attrs.width;
                    var height = attrs.height;
                    var enabledAnchors = this.enabledAnchors();
                    var resizeEnabled = this.resizeEnabled();
                    var padding = this.padding();
                    var anchorSize = this.anchorSize();
                    this.find('._anchor').forEach((node) => {
                        node.setAttrs({
                            width: anchorSize,
                            height: anchorSize,
                            offsetX: anchorSize / 2,
                            offsetY: anchorSize / 2,
                            stroke: this.anchorStroke(),
                            strokeWidth: this.anchorStrokeWidth(),
                            fill: this.anchorFill(),
                            cornerRadius: this.anchorCornerRadius(),
                        });
                    });
                    this._batchChangeChild('.top-left', {
                        x: 0,
                        y: 0,
                        offsetX: anchorSize / 2 + padding,
                        offsetY: anchorSize / 2 + padding,
                        visible: resizeEnabled && enabledAnchors.indexOf('top-left') >= 0,
                    });
                    this._batchChangeChild('.top-center', {
                        x: width / 2,
                        y: 0,
                        offsetY: anchorSize / 2 + padding,
                        visible: resizeEnabled && enabledAnchors.indexOf('top-center') >= 0,
                    });
                    this._batchChangeChild('.top-right', {
                        x: width,
                        y: 0,
                        offsetX: anchorSize / 2 - padding,
                        offsetY: anchorSize / 2 + padding,
                        visible: resizeEnabled && enabledAnchors.indexOf('top-right') >= 0,
                    });
                    this._batchChangeChild('.middle-left', {
                        x: 0,
                        y: height / 2,
                        offsetX: anchorSize / 2 + padding,
                        visible: resizeEnabled && enabledAnchors.indexOf('middle-left') >= 0,
                    });
                    this._batchChangeChild('.middle-right', {
                        x: width,
                        y: height / 2,
                        offsetX: anchorSize / 2 - padding,
                        visible: resizeEnabled && enabledAnchors.indexOf('middle-right') >= 0,
                    });
                    this._batchChangeChild('.bottom-left', {
                        x: 0,
                        y: height,
                        offsetX: anchorSize / 2 + padding,
                        offsetY: anchorSize / 2 - padding,
                        visible: resizeEnabled && enabledAnchors.indexOf('bottom-left') >= 0,
                    });
                    this._batchChangeChild('.bottom-center', {
                        x: width / 2,
                        y: height,
                        offsetY: anchorSize / 2 - padding,
                        visible: resizeEnabled && enabledAnchors.indexOf('bottom-center') >= 0,
                    });
                    this._batchChangeChild('.bottom-right', {
                        x: width,
                        y: height,
                        offsetX: anchorSize / 2 - padding,
                        offsetY: anchorSize / 2 - padding,
                        visible: resizeEnabled && enabledAnchors.indexOf('bottom-right') >= 0,
                    });
                    this._batchChangeChild('.rotater', {
                        x: width / 2,
                        y: -this.rotateAnchorOffset() * Util._sign(height) - padding,
                        visible: this.rotateEnabled(),
                    });
                    this._batchChangeChild('.back', {
                        width: width,
                        height: height,
                        visible: this.borderEnabled(),
                        stroke: this.borderStroke(),
                        strokeWidth: this.borderStrokeWidth(),
                        dash: this.borderDash(),
                        x: 0,
                        y: 0,
                    });
                    (_a = this.getLayer()) === null || _a === void 0 ? void 0 : _a.batchDraw();
                }
                isTransforming() {
                    return this._transforming;
                }
                stopTransform() {
                    if (this._transforming) {
                        this._removeEvents();
                        var anchorNode = this.findOne('.' + this._movingAnchorName);
                        if (anchorNode) {
                            anchorNode.stopDrag();
                        }
                    }
                }
                destroy() {
                    if (this.getStage() && this._cursorChange) {
                        this.getStage().content && (this.getStage().content.style.cursor = '');
                    }
                    Group$2.prototype.destroy.call(this);
                    this.detach();
                    this._removeEvents();
                    return this;
                }
                toObject() {
                    return Node.prototype.toObject.call(this);
                }
                clone(obj) {
                    var node = Node.prototype.clone.call(this, obj);
                    return node;
                }
                getClientRect() {
                    if (this.nodes().length > 0) {
                        return super.getClientRect();
                    }
                    else {
                        return { x: 0, y: 0, width: 0, height: 0 };
                    }
                }
            }
            function validateAnchors(val) {
                if (!(val instanceof Array)) {
                    Util.warn('enabledAnchors value should be an array');
                }
                if (val instanceof Array) {
                    val.forEach(function (name) {
                        if (ANCHORS_NAMES.indexOf(name) === -1) {
                            Util.warn('Unknown anchor name: ' +
                                name +
                                '. Available names are: ' +
                                ANCHORS_NAMES.join(', '));
                        }
                    });
                }
                return val || [];
            }
            Transformer.prototype.className = 'Transformer';
            _registerNode(Transformer);
            Factory.addGetterSetter(Transformer, 'enabledAnchors', ANCHORS_NAMES, validateAnchors);
            Factory.addGetterSetter(Transformer, 'flipEnabled', true, getBooleanValidator());
            Factory.addGetterSetter(Transformer, 'resizeEnabled', true);
            Factory.addGetterSetter(Transformer, 'anchorSize', 10, getNumberValidator());
            Factory.addGetterSetter(Transformer, 'rotateEnabled', true);
            Factory.addGetterSetter(Transformer, 'rotationSnaps', []);
            Factory.addGetterSetter(Transformer, 'rotateAnchorOffset', 50, getNumberValidator());
            Factory.addGetterSetter(Transformer, 'rotationSnapTolerance', 5, getNumberValidator());
            Factory.addGetterSetter(Transformer, 'borderEnabled', true);
            Factory.addGetterSetter(Transformer, 'anchorStroke', 'rgb(0, 161, 255)');
            Factory.addGetterSetter(Transformer, 'anchorStrokeWidth', 1, getNumberValidator());
            Factory.addGetterSetter(Transformer, 'anchorFill', 'white');
            Factory.addGetterSetter(Transformer, 'anchorCornerRadius', 0, getNumberValidator());
            Factory.addGetterSetter(Transformer, 'borderStroke', 'rgb(0, 161, 255)');
            Factory.addGetterSetter(Transformer, 'borderStrokeWidth', 1, getNumberValidator());
            Factory.addGetterSetter(Transformer, 'borderDash');
            Factory.addGetterSetter(Transformer, 'keepRatio', true);
            Factory.addGetterSetter(Transformer, 'centeredScaling', false);
            Factory.addGetterSetter(Transformer, 'ignoreStroke', false);
            Factory.addGetterSetter(Transformer, 'padding', 0, getNumberValidator());
            Factory.addGetterSetter(Transformer, 'node');
            Factory.addGetterSetter(Transformer, 'nodes');
            Factory.addGetterSetter(Transformer, 'boundBoxFunc');
            Factory.addGetterSetter(Transformer, 'anchorDragBoundFunc');
            Factory.addGetterSetter(Transformer, 'shouldOverdrawWholeArea', false);
            Factory.addGetterSetter(Transformer, 'useSingleNodeRotation', true);
            Factory.backCompat(Transformer, {
                lineEnabled: 'borderEnabled',
                rotateHandlerOffset: 'rotateAnchorOffset',
                enabledHandlers: 'enabledAnchors',
            });

            class Wedge extends Shape {
                _sceneFunc(context) {
                    context.beginPath();
                    context.arc(0, 0, this.radius(), 0, Konva$2.getAngle(this.angle()), this.clockwise());
                    context.lineTo(0, 0);
                    context.closePath();
                    context.fillStrokeShape(this);
                }
                getWidth() {
                    return this.radius() * 2;
                }
                getHeight() {
                    return this.radius() * 2;
                }
                setWidth(width) {
                    this.radius(width / 2);
                }
                setHeight(height) {
                    this.radius(height / 2);
                }
            }
            Wedge.prototype.className = 'Wedge';
            Wedge.prototype._centroid = true;
            Wedge.prototype._attrsAffectingSize = ['radius'];
            _registerNode(Wedge);
            Factory.addGetterSetter(Wedge, 'radius', 0, getNumberValidator());
            Factory.addGetterSetter(Wedge, 'angle', 0, getNumberValidator());
            Factory.addGetterSetter(Wedge, 'clockwise', false);
            Factory.backCompat(Wedge, {
                angleDeg: 'angle',
                getAngleDeg: 'getAngle',
                setAngleDeg: 'setAngle',
            });

            function BlurStack() {
                this.r = 0;
                this.g = 0;
                this.b = 0;
                this.a = 0;
                this.next = null;
            }
            var mul_table = [
                512,
                512,
                456,
                512,
                328,
                456,
                335,
                512,
                405,
                328,
                271,
                456,
                388,
                335,
                292,
                512,
                454,
                405,
                364,
                328,
                298,
                271,
                496,
                456,
                420,
                388,
                360,
                335,
                312,
                292,
                273,
                512,
                482,
                454,
                428,
                405,
                383,
                364,
                345,
                328,
                312,
                298,
                284,
                271,
                259,
                496,
                475,
                456,
                437,
                420,
                404,
                388,
                374,
                360,
                347,
                335,
                323,
                312,
                302,
                292,
                282,
                273,
                265,
                512,
                497,
                482,
                468,
                454,
                441,
                428,
                417,
                405,
                394,
                383,
                373,
                364,
                354,
                345,
                337,
                328,
                320,
                312,
                305,
                298,
                291,
                284,
                278,
                271,
                265,
                259,
                507,
                496,
                485,
                475,
                465,
                456,
                446,
                437,
                428,
                420,
                412,
                404,
                396,
                388,
                381,
                374,
                367,
                360,
                354,
                347,
                341,
                335,
                329,
                323,
                318,
                312,
                307,
                302,
                297,
                292,
                287,
                282,
                278,
                273,
                269,
                265,
                261,
                512,
                505,
                497,
                489,
                482,
                475,
                468,
                461,
                454,
                447,
                441,
                435,
                428,
                422,
                417,
                411,
                405,
                399,
                394,
                389,
                383,
                378,
                373,
                368,
                364,
                359,
                354,
                350,
                345,
                341,
                337,
                332,
                328,
                324,
                320,
                316,
                312,
                309,
                305,
                301,
                298,
                294,
                291,
                287,
                284,
                281,
                278,
                274,
                271,
                268,
                265,
                262,
                259,
                257,
                507,
                501,
                496,
                491,
                485,
                480,
                475,
                470,
                465,
                460,
                456,
                451,
                446,
                442,
                437,
                433,
                428,
                424,
                420,
                416,
                412,
                408,
                404,
                400,
                396,
                392,
                388,
                385,
                381,
                377,
                374,
                370,
                367,
                363,
                360,
                357,
                354,
                350,
                347,
                344,
                341,
                338,
                335,
                332,
                329,
                326,
                323,
                320,
                318,
                315,
                312,
                310,
                307,
                304,
                302,
                299,
                297,
                294,
                292,
                289,
                287,
                285,
                282,
                280,
                278,
                275,
                273,
                271,
                269,
                267,
                265,
                263,
                261,
                259,
            ];
            var shg_table = [
                9,
                11,
                12,
                13,
                13,
                14,
                14,
                15,
                15,
                15,
                15,
                16,
                16,
                16,
                16,
                17,
                17,
                17,
                17,
                17,
                17,
                17,
                18,
                18,
                18,
                18,
                18,
                18,
                18,
                18,
                18,
                19,
                19,
                19,
                19,
                19,
                19,
                19,
                19,
                19,
                19,
                19,
                19,
                19,
                19,
                20,
                20,
                20,
                20,
                20,
                20,
                20,
                20,
                20,
                20,
                20,
                20,
                20,
                20,
                20,
                20,
                20,
                20,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                21,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                22,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                23,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
                24,
            ];
            function filterGaussBlurRGBA(imageData, radius) {
                var pixels = imageData.data, width = imageData.width, height = imageData.height;
                var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;
                var div = radius + radius + 1, widthMinus1 = width - 1, heightMinus1 = height - 1, radiusPlus1 = radius + 1, sumFactor = (radiusPlus1 * (radiusPlus1 + 1)) / 2, stackStart = new BlurStack(), stackEnd = null, stack = stackStart, stackIn = null, stackOut = null, mul_sum = mul_table[radius], shg_sum = shg_table[radius];
                for (i = 1; i < div; i++) {
                    stack = stack.next = new BlurStack();
                    if (i === radiusPlus1) {
                        stackEnd = stack;
                    }
                }
                stack.next = stackStart;
                yw = yi = 0;
                for (y = 0; y < height; y++) {
                    r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;
                    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
                    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
                    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
                    a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
                    r_sum += sumFactor * pr;
                    g_sum += sumFactor * pg;
                    b_sum += sumFactor * pb;
                    a_sum += sumFactor * pa;
                    stack = stackStart;
                    for (i = 0; i < radiusPlus1; i++) {
                        stack.r = pr;
                        stack.g = pg;
                        stack.b = pb;
                        stack.a = pa;
                        stack = stack.next;
                    }
                    for (i = 1; i < radiusPlus1; i++) {
                        p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
                        r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
                        g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
                        b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
                        a_sum += (stack.a = pa = pixels[p + 3]) * rbs;
                        r_in_sum += pr;
                        g_in_sum += pg;
                        b_in_sum += pb;
                        a_in_sum += pa;
                        stack = stack.next;
                    }
                    stackIn = stackStart;
                    stackOut = stackEnd;
                    for (x = 0; x < width; x++) {
                        pixels[yi + 3] = pa = (a_sum * mul_sum) >> shg_sum;
                        if (pa !== 0) {
                            pa = 255 / pa;
                            pixels[yi] = ((r_sum * mul_sum) >> shg_sum) * pa;
                            pixels[yi + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                            pixels[yi + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
                        }
                        else {
                            pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
                        }
                        r_sum -= r_out_sum;
                        g_sum -= g_out_sum;
                        b_sum -= b_out_sum;
                        a_sum -= a_out_sum;
                        r_out_sum -= stackIn.r;
                        g_out_sum -= stackIn.g;
                        b_out_sum -= stackIn.b;
                        a_out_sum -= stackIn.a;
                        p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;
                        r_in_sum += stackIn.r = pixels[p];
                        g_in_sum += stackIn.g = pixels[p + 1];
                        b_in_sum += stackIn.b = pixels[p + 2];
                        a_in_sum += stackIn.a = pixels[p + 3];
                        r_sum += r_in_sum;
                        g_sum += g_in_sum;
                        b_sum += b_in_sum;
                        a_sum += a_in_sum;
                        stackIn = stackIn.next;
                        r_out_sum += pr = stackOut.r;
                        g_out_sum += pg = stackOut.g;
                        b_out_sum += pb = stackOut.b;
                        a_out_sum += pa = stackOut.a;
                        r_in_sum -= pr;
                        g_in_sum -= pg;
                        b_in_sum -= pb;
                        a_in_sum -= pa;
                        stackOut = stackOut.next;
                        yi += 4;
                    }
                    yw += width;
                }
                for (x = 0; x < width; x++) {
                    g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;
                    yi = x << 2;
                    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
                    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
                    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
                    a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
                    r_sum += sumFactor * pr;
                    g_sum += sumFactor * pg;
                    b_sum += sumFactor * pb;
                    a_sum += sumFactor * pa;
                    stack = stackStart;
                    for (i = 0; i < radiusPlus1; i++) {
                        stack.r = pr;
                        stack.g = pg;
                        stack.b = pb;
                        stack.a = pa;
                        stack = stack.next;
                    }
                    yp = width;
                    for (i = 1; i <= radius; i++) {
                        yi = (yp + x) << 2;
                        r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
                        g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
                        b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
                        a_sum += (stack.a = pa = pixels[yi + 3]) * rbs;
                        r_in_sum += pr;
                        g_in_sum += pg;
                        b_in_sum += pb;
                        a_in_sum += pa;
                        stack = stack.next;
                        if (i < heightMinus1) {
                            yp += width;
                        }
                    }
                    yi = x;
                    stackIn = stackStart;
                    stackOut = stackEnd;
                    for (y = 0; y < height; y++) {
                        p = yi << 2;
                        pixels[p + 3] = pa = (a_sum * mul_sum) >> shg_sum;
                        if (pa > 0) {
                            pa = 255 / pa;
                            pixels[p] = ((r_sum * mul_sum) >> shg_sum) * pa;
                            pixels[p + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                            pixels[p + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
                        }
                        else {
                            pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
                        }
                        r_sum -= r_out_sum;
                        g_sum -= g_out_sum;
                        b_sum -= b_out_sum;
                        a_sum -= a_out_sum;
                        r_out_sum -= stackIn.r;
                        g_out_sum -= stackIn.g;
                        b_out_sum -= stackIn.b;
                        a_out_sum -= stackIn.a;
                        p =
                            (x +
                                ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width) <<
                                2;
                        r_sum += r_in_sum += stackIn.r = pixels[p];
                        g_sum += g_in_sum += stackIn.g = pixels[p + 1];
                        b_sum += b_in_sum += stackIn.b = pixels[p + 2];
                        a_sum += a_in_sum += stackIn.a = pixels[p + 3];
                        stackIn = stackIn.next;
                        r_out_sum += pr = stackOut.r;
                        g_out_sum += pg = stackOut.g;
                        b_out_sum += pb = stackOut.b;
                        a_out_sum += pa = stackOut.a;
                        r_in_sum -= pr;
                        g_in_sum -= pg;
                        b_in_sum -= pb;
                        a_in_sum -= pa;
                        stackOut = stackOut.next;
                        yi += width;
                    }
                }
            }
            const Blur = function Blur(imageData) {
                var radius = Math.round(this.blurRadius());
                if (radius > 0) {
                    filterGaussBlurRGBA(imageData, radius);
                }
            };
            Factory.addGetterSetter(Node, 'blurRadius', 0, getNumberValidator(), Factory.afterSetFilter);

            const Brighten = function (imageData) {
                var brightness = this.brightness() * 255, data = imageData.data, len = data.length, i;
                for (i = 0; i < len; i += 4) {
                    data[i] += brightness;
                    data[i + 1] += brightness;
                    data[i + 2] += brightness;
                }
            };
            Factory.addGetterSetter(Node, 'brightness', 0, getNumberValidator(), Factory.afterSetFilter);

            const Contrast = function (imageData) {
                var adjust = Math.pow((this.contrast() + 100) / 100, 2);
                var data = imageData.data, nPixels = data.length, red = 150, green = 150, blue = 150, i;
                for (i = 0; i < nPixels; i += 4) {
                    red = data[i];
                    green = data[i + 1];
                    blue = data[i + 2];
                    red /= 255;
                    red -= 0.5;
                    red *= adjust;
                    red += 0.5;
                    red *= 255;
                    green /= 255;
                    green -= 0.5;
                    green *= adjust;
                    green += 0.5;
                    green *= 255;
                    blue /= 255;
                    blue -= 0.5;
                    blue *= adjust;
                    blue += 0.5;
                    blue *= 255;
                    red = red < 0 ? 0 : red > 255 ? 255 : red;
                    green = green < 0 ? 0 : green > 255 ? 255 : green;
                    blue = blue < 0 ? 0 : blue > 255 ? 255 : blue;
                    data[i] = red;
                    data[i + 1] = green;
                    data[i + 2] = blue;
                }
            };
            Factory.addGetterSetter(Node, 'contrast', 0, getNumberValidator(), Factory.afterSetFilter);

            const Emboss = function (imageData) {
                var strength = this.embossStrength() * 10, greyLevel = this.embossWhiteLevel() * 255, direction = this.embossDirection(), blend = this.embossBlend(), dirY = 0, dirX = 0, data = imageData.data, w = imageData.width, h = imageData.height, w4 = w * 4, y = h;
                switch (direction) {
                    case 'top-left':
                        dirY = -1;
                        dirX = -1;
                        break;
                    case 'top':
                        dirY = -1;
                        dirX = 0;
                        break;
                    case 'top-right':
                        dirY = -1;
                        dirX = 1;
                        break;
                    case 'right':
                        dirY = 0;
                        dirX = 1;
                        break;
                    case 'bottom-right':
                        dirY = 1;
                        dirX = 1;
                        break;
                    case 'bottom':
                        dirY = 1;
                        dirX = 0;
                        break;
                    case 'bottom-left':
                        dirY = 1;
                        dirX = -1;
                        break;
                    case 'left':
                        dirY = 0;
                        dirX = -1;
                        break;
                    default:
                        Util.error('Unknown emboss direction: ' + direction);
                }
                do {
                    var offsetY = (y - 1) * w4;
                    var otherY = dirY;
                    if (y + otherY < 1) {
                        otherY = 0;
                    }
                    if (y + otherY > h) {
                        otherY = 0;
                    }
                    var offsetYOther = (y - 1 + otherY) * w * 4;
                    var x = w;
                    do {
                        var offset = offsetY + (x - 1) * 4;
                        var otherX = dirX;
                        if (x + otherX < 1) {
                            otherX = 0;
                        }
                        if (x + otherX > w) {
                            otherX = 0;
                        }
                        var offsetOther = offsetYOther + (x - 1 + otherX) * 4;
                        var dR = data[offset] - data[offsetOther];
                        var dG = data[offset + 1] - data[offsetOther + 1];
                        var dB = data[offset + 2] - data[offsetOther + 2];
                        var dif = dR;
                        var absDif = dif > 0 ? dif : -dif;
                        var absG = dG > 0 ? dG : -dG;
                        var absB = dB > 0 ? dB : -dB;
                        if (absG > absDif) {
                            dif = dG;
                        }
                        if (absB > absDif) {
                            dif = dB;
                        }
                        dif *= strength;
                        if (blend) {
                            var r = data[offset] + dif;
                            var g = data[offset + 1] + dif;
                            var b = data[offset + 2] + dif;
                            data[offset] = r > 255 ? 255 : r < 0 ? 0 : r;
                            data[offset + 1] = g > 255 ? 255 : g < 0 ? 0 : g;
                            data[offset + 2] = b > 255 ? 255 : b < 0 ? 0 : b;
                        }
                        else {
                            var grey = greyLevel - dif;
                            if (grey < 0) {
                                grey = 0;
                            }
                            else if (grey > 255) {
                                grey = 255;
                            }
                            data[offset] = data[offset + 1] = data[offset + 2] = grey;
                        }
                    } while (--x);
                } while (--y);
            };
            Factory.addGetterSetter(Node, 'embossStrength', 0.5, getNumberValidator(), Factory.afterSetFilter);
            Factory.addGetterSetter(Node, 'embossWhiteLevel', 0.5, getNumberValidator(), Factory.afterSetFilter);
            Factory.addGetterSetter(Node, 'embossDirection', 'top-left', null, Factory.afterSetFilter);
            Factory.addGetterSetter(Node, 'embossBlend', false, null, Factory.afterSetFilter);

            function remap(fromValue, fromMin, fromMax, toMin, toMax) {
                var fromRange = fromMax - fromMin, toRange = toMax - toMin, toValue;
                if (fromRange === 0) {
                    return toMin + toRange / 2;
                }
                if (toRange === 0) {
                    return toMin;
                }
                toValue = (fromValue - fromMin) / fromRange;
                toValue = toRange * toValue + toMin;
                return toValue;
            }
            const Enhance = function (imageData) {
                var data = imageData.data, nSubPixels = data.length, rMin = data[0], rMax = rMin, r, gMin = data[1], gMax = gMin, g, bMin = data[2], bMax = bMin, b, i;
                var enhanceAmount = this.enhance();
                if (enhanceAmount === 0) {
                    return;
                }
                for (i = 0; i < nSubPixels; i += 4) {
                    r = data[i + 0];
                    if (r < rMin) {
                        rMin = r;
                    }
                    else if (r > rMax) {
                        rMax = r;
                    }
                    g = data[i + 1];
                    if (g < gMin) {
                        gMin = g;
                    }
                    else if (g > gMax) {
                        gMax = g;
                    }
                    b = data[i + 2];
                    if (b < bMin) {
                        bMin = b;
                    }
                    else if (b > bMax) {
                        bMax = b;
                    }
                }
                if (rMax === rMin) {
                    rMax = 255;
                    rMin = 0;
                }
                if (gMax === gMin) {
                    gMax = 255;
                    gMin = 0;
                }
                if (bMax === bMin) {
                    bMax = 255;
                    bMin = 0;
                }
                var rMid, rGoalMax, rGoalMin, gMid, gGoalMax, gGoalMin, bMid, bGoalMax, bGoalMin;
                if (enhanceAmount > 0) {
                    rGoalMax = rMax + enhanceAmount * (255 - rMax);
                    rGoalMin = rMin - enhanceAmount * (rMin - 0);
                    gGoalMax = gMax + enhanceAmount * (255 - gMax);
                    gGoalMin = gMin - enhanceAmount * (gMin - 0);
                    bGoalMax = bMax + enhanceAmount * (255 - bMax);
                    bGoalMin = bMin - enhanceAmount * (bMin - 0);
                }
                else {
                    rMid = (rMax + rMin) * 0.5;
                    rGoalMax = rMax + enhanceAmount * (rMax - rMid);
                    rGoalMin = rMin + enhanceAmount * (rMin - rMid);
                    gMid = (gMax + gMin) * 0.5;
                    gGoalMax = gMax + enhanceAmount * (gMax - gMid);
                    gGoalMin = gMin + enhanceAmount * (gMin - gMid);
                    bMid = (bMax + bMin) * 0.5;
                    bGoalMax = bMax + enhanceAmount * (bMax - bMid);
                    bGoalMin = bMin + enhanceAmount * (bMin - bMid);
                }
                for (i = 0; i < nSubPixels; i += 4) {
                    data[i + 0] = remap(data[i + 0], rMin, rMax, rGoalMin, rGoalMax);
                    data[i + 1] = remap(data[i + 1], gMin, gMax, gGoalMin, gGoalMax);
                    data[i + 2] = remap(data[i + 2], bMin, bMax, bGoalMin, bGoalMax);
                }
            };
            Factory.addGetterSetter(Node, 'enhance', 0, getNumberValidator(), Factory.afterSetFilter);

            const Grayscale = function (imageData) {
                var data = imageData.data, len = data.length, i, brightness;
                for (i = 0; i < len; i += 4) {
                    brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
                    data[i] = brightness;
                    data[i + 1] = brightness;
                    data[i + 2] = brightness;
                }
            };

            Factory.addGetterSetter(Node, 'hue', 0, getNumberValidator(), Factory.afterSetFilter);
            Factory.addGetterSetter(Node, 'saturation', 0, getNumberValidator(), Factory.afterSetFilter);
            Factory.addGetterSetter(Node, 'luminance', 0, getNumberValidator(), Factory.afterSetFilter);
            const HSL = function (imageData) {
                var data = imageData.data, nPixels = data.length, v = 1, s = Math.pow(2, this.saturation()), h = Math.abs(this.hue() + 360) % 360, l = this.luminance() * 127, i;
                var vsu = v * s * Math.cos((h * Math.PI) / 180), vsw = v * s * Math.sin((h * Math.PI) / 180);
                var rr = 0.299 * v + 0.701 * vsu + 0.167 * vsw, rg = 0.587 * v - 0.587 * vsu + 0.33 * vsw, rb = 0.114 * v - 0.114 * vsu - 0.497 * vsw;
                var gr = 0.299 * v - 0.299 * vsu - 0.328 * vsw, gg = 0.587 * v + 0.413 * vsu + 0.035 * vsw, gb = 0.114 * v - 0.114 * vsu + 0.293 * vsw;
                var br = 0.299 * v - 0.3 * vsu + 1.25 * vsw, bg = 0.587 * v - 0.586 * vsu - 1.05 * vsw, bb = 0.114 * v + 0.886 * vsu - 0.2 * vsw;
                var r, g, b, a;
                for (i = 0; i < nPixels; i += 4) {
                    r = data[i + 0];
                    g = data[i + 1];
                    b = data[i + 2];
                    a = data[i + 3];
                    data[i + 0] = rr * r + rg * g + rb * b + l;
                    data[i + 1] = gr * r + gg * g + gb * b + l;
                    data[i + 2] = br * r + bg * g + bb * b + l;
                    data[i + 3] = a;
                }
            };

            const HSV = function (imageData) {
                var data = imageData.data, nPixels = data.length, v = Math.pow(2, this.value()), s = Math.pow(2, this.saturation()), h = Math.abs(this.hue() + 360) % 360, i;
                var vsu = v * s * Math.cos((h * Math.PI) / 180), vsw = v * s * Math.sin((h * Math.PI) / 180);
                var rr = 0.299 * v + 0.701 * vsu + 0.167 * vsw, rg = 0.587 * v - 0.587 * vsu + 0.33 * vsw, rb = 0.114 * v - 0.114 * vsu - 0.497 * vsw;
                var gr = 0.299 * v - 0.299 * vsu - 0.328 * vsw, gg = 0.587 * v + 0.413 * vsu + 0.035 * vsw, gb = 0.114 * v - 0.114 * vsu + 0.293 * vsw;
                var br = 0.299 * v - 0.3 * vsu + 1.25 * vsw, bg = 0.587 * v - 0.586 * vsu - 1.05 * vsw, bb = 0.114 * v + 0.886 * vsu - 0.2 * vsw;
                var r, g, b, a;
                for (i = 0; i < nPixels; i += 4) {
                    r = data[i + 0];
                    g = data[i + 1];
                    b = data[i + 2];
                    a = data[i + 3];
                    data[i + 0] = rr * r + rg * g + rb * b;
                    data[i + 1] = gr * r + gg * g + gb * b;
                    data[i + 2] = br * r + bg * g + bb * b;
                    data[i + 3] = a;
                }
            };
            Factory.addGetterSetter(Node, 'hue', 0, getNumberValidator(), Factory.afterSetFilter);
            Factory.addGetterSetter(Node, 'saturation', 0, getNumberValidator(), Factory.afterSetFilter);
            Factory.addGetterSetter(Node, 'value', 0, getNumberValidator(), Factory.afterSetFilter);

            const Invert = function (imageData) {
                var data = imageData.data, len = data.length, i;
                for (i = 0; i < len; i += 4) {
                    data[i] = 255 - data[i];
                    data[i + 1] = 255 - data[i + 1];
                    data[i + 2] = 255 - data[i + 2];
                }
            };

            var ToPolar = function (src, dst, opt) {
                var srcPixels = src.data, dstPixels = dst.data, xSize = src.width, ySize = src.height, xMid = opt.polarCenterX || xSize / 2, yMid = opt.polarCenterY || ySize / 2, i, x, y, r = 0, g = 0, b = 0, a = 0;
                var rad, rMax = Math.sqrt(xMid * xMid + yMid * yMid);
                x = xSize - xMid;
                y = ySize - yMid;
                rad = Math.sqrt(x * x + y * y);
                rMax = rad > rMax ? rad : rMax;
                var rSize = ySize, tSize = xSize, radius, theta;
                var conversion = ((360 / tSize) * Math.PI) / 180, sin, cos;
                for (theta = 0; theta < tSize; theta += 1) {
                    sin = Math.sin(theta * conversion);
                    cos = Math.cos(theta * conversion);
                    for (radius = 0; radius < rSize; radius += 1) {
                        x = Math.floor(xMid + ((rMax * radius) / rSize) * cos);
                        y = Math.floor(yMid + ((rMax * radius) / rSize) * sin);
                        i = (y * xSize + x) * 4;
                        r = srcPixels[i + 0];
                        g = srcPixels[i + 1];
                        b = srcPixels[i + 2];
                        a = srcPixels[i + 3];
                        i = (theta + radius * xSize) * 4;
                        dstPixels[i + 0] = r;
                        dstPixels[i + 1] = g;
                        dstPixels[i + 2] = b;
                        dstPixels[i + 3] = a;
                    }
                }
            };
            var FromPolar = function (src, dst, opt) {
                var srcPixels = src.data, dstPixels = dst.data, xSize = src.width, ySize = src.height, xMid = opt.polarCenterX || xSize / 2, yMid = opt.polarCenterY || ySize / 2, i, x, y, dx, dy, r = 0, g = 0, b = 0, a = 0;
                var rad, rMax = Math.sqrt(xMid * xMid + yMid * yMid);
                x = xSize - xMid;
                y = ySize - yMid;
                rad = Math.sqrt(x * x + y * y);
                rMax = rad > rMax ? rad : rMax;
                var rSize = ySize, tSize = xSize, radius, theta, phaseShift = opt.polarRotation || 0;
                var x1, y1;
                for (x = 0; x < xSize; x += 1) {
                    for (y = 0; y < ySize; y += 1) {
                        dx = x - xMid;
                        dy = y - yMid;
                        radius = (Math.sqrt(dx * dx + dy * dy) * rSize) / rMax;
                        theta = ((Math.atan2(dy, dx) * 180) / Math.PI + 360 + phaseShift) % 360;
                        theta = (theta * tSize) / 360;
                        x1 = Math.floor(theta);
                        y1 = Math.floor(radius);
                        i = (y1 * xSize + x1) * 4;
                        r = srcPixels[i + 0];
                        g = srcPixels[i + 1];
                        b = srcPixels[i + 2];
                        a = srcPixels[i + 3];
                        i = (y * xSize + x) * 4;
                        dstPixels[i + 0] = r;
                        dstPixels[i + 1] = g;
                        dstPixels[i + 2] = b;
                        dstPixels[i + 3] = a;
                    }
                }
            };
            const Kaleidoscope = function (imageData) {
                var xSize = imageData.width, ySize = imageData.height;
                var x, y, xoff, i, r, g, b, a, srcPos, dstPos;
                var power = Math.round(this.kaleidoscopePower());
                var angle = Math.round(this.kaleidoscopeAngle());
                var offset = Math.floor((xSize * (angle % 360)) / 360);
                if (power < 1) {
                    return;
                }
                var tempCanvas = Util.createCanvasElement();
                tempCanvas.width = xSize;
                tempCanvas.height = ySize;
                var scratchData = tempCanvas
                    .getContext('2d')
                    .getImageData(0, 0, xSize, ySize);
                Util.releaseCanvas(tempCanvas);
                ToPolar(imageData, scratchData, {
                    polarCenterX: xSize / 2,
                    polarCenterY: ySize / 2,
                });
                var minSectionSize = xSize / Math.pow(2, power);
                while (minSectionSize <= 8) {
                    minSectionSize = minSectionSize * 2;
                    power -= 1;
                }
                minSectionSize = Math.ceil(minSectionSize);
                var sectionSize = minSectionSize;
                var xStart = 0, xEnd = sectionSize, xDelta = 1;
                if (offset + minSectionSize > xSize) {
                    xStart = sectionSize;
                    xEnd = 0;
                    xDelta = -1;
                }
                for (y = 0; y < ySize; y += 1) {
                    for (x = xStart; x !== xEnd; x += xDelta) {
                        xoff = Math.round(x + offset) % xSize;
                        srcPos = (xSize * y + xoff) * 4;
                        r = scratchData.data[srcPos + 0];
                        g = scratchData.data[srcPos + 1];
                        b = scratchData.data[srcPos + 2];
                        a = scratchData.data[srcPos + 3];
                        dstPos = (xSize * y + x) * 4;
                        scratchData.data[dstPos + 0] = r;
                        scratchData.data[dstPos + 1] = g;
                        scratchData.data[dstPos + 2] = b;
                        scratchData.data[dstPos + 3] = a;
                    }
                }
                for (y = 0; y < ySize; y += 1) {
                    sectionSize = Math.floor(minSectionSize);
                    for (i = 0; i < power; i += 1) {
                        for (x = 0; x < sectionSize + 1; x += 1) {
                            srcPos = (xSize * y + x) * 4;
                            r = scratchData.data[srcPos + 0];
                            g = scratchData.data[srcPos + 1];
                            b = scratchData.data[srcPos + 2];
                            a = scratchData.data[srcPos + 3];
                            dstPos = (xSize * y + sectionSize * 2 - x - 1) * 4;
                            scratchData.data[dstPos + 0] = r;
                            scratchData.data[dstPos + 1] = g;
                            scratchData.data[dstPos + 2] = b;
                            scratchData.data[dstPos + 3] = a;
                        }
                        sectionSize *= 2;
                    }
                }
                FromPolar(scratchData, imageData, { polarRotation: 0 });
            };
            Factory.addGetterSetter(Node, 'kaleidoscopePower', 2, getNumberValidator(), Factory.afterSetFilter);
            Factory.addGetterSetter(Node, 'kaleidoscopeAngle', 0, getNumberValidator(), Factory.afterSetFilter);

            function pixelAt(idata, x, y) {
                var idx = (y * idata.width + x) * 4;
                var d = [];
                d.push(idata.data[idx++], idata.data[idx++], idata.data[idx++], idata.data[idx++]);
                return d;
            }
            function rgbDistance(p1, p2) {
                return Math.sqrt(Math.pow(p1[0] - p2[0], 2) +
                    Math.pow(p1[1] - p2[1], 2) +
                    Math.pow(p1[2] - p2[2], 2));
            }
            function rgbMean(pTab) {
                var m = [0, 0, 0];
                for (var i = 0; i < pTab.length; i++) {
                    m[0] += pTab[i][0];
                    m[1] += pTab[i][1];
                    m[2] += pTab[i][2];
                }
                m[0] /= pTab.length;
                m[1] /= pTab.length;
                m[2] /= pTab.length;
                return m;
            }
            function backgroundMask(idata, threshold) {
                var rgbv_no = pixelAt(idata, 0, 0);
                var rgbv_ne = pixelAt(idata, idata.width - 1, 0);
                var rgbv_so = pixelAt(idata, 0, idata.height - 1);
                var rgbv_se = pixelAt(idata, idata.width - 1, idata.height - 1);
                var thres = threshold || 10;
                if (rgbDistance(rgbv_no, rgbv_ne) < thres &&
                    rgbDistance(rgbv_ne, rgbv_se) < thres &&
                    rgbDistance(rgbv_se, rgbv_so) < thres &&
                    rgbDistance(rgbv_so, rgbv_no) < thres) {
                    var mean = rgbMean([rgbv_ne, rgbv_no, rgbv_se, rgbv_so]);
                    var mask = [];
                    for (var i = 0; i < idata.width * idata.height; i++) {
                        var d = rgbDistance(mean, [
                            idata.data[i * 4],
                            idata.data[i * 4 + 1],
                            idata.data[i * 4 + 2],
                        ]);
                        mask[i] = d < thres ? 0 : 255;
                    }
                    return mask;
                }
            }
            function applyMask(idata, mask) {
                for (var i = 0; i < idata.width * idata.height; i++) {
                    idata.data[4 * i + 3] = mask[i];
                }
            }
            function erodeMask(mask, sw, sh) {
                var weights = [1, 1, 1, 1, 0, 1, 1, 1, 1];
                var side = Math.round(Math.sqrt(weights.length));
                var halfSide = Math.floor(side / 2);
                var maskResult = [];
                for (var y = 0; y < sh; y++) {
                    for (var x = 0; x < sw; x++) {
                        var so = y * sw + x;
                        var a = 0;
                        for (var cy = 0; cy < side; cy++) {
                            for (var cx = 0; cx < side; cx++) {
                                var scy = y + cy - halfSide;
                                var scx = x + cx - halfSide;
                                if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                                    var srcOff = scy * sw + scx;
                                    var wt = weights[cy * side + cx];
                                    a += mask[srcOff] * wt;
                                }
                            }
                        }
                        maskResult[so] = a === 255 * 8 ? 255 : 0;
                    }
                }
                return maskResult;
            }
            function dilateMask(mask, sw, sh) {
                var weights = [1, 1, 1, 1, 1, 1, 1, 1, 1];
                var side = Math.round(Math.sqrt(weights.length));
                var halfSide = Math.floor(side / 2);
                var maskResult = [];
                for (var y = 0; y < sh; y++) {
                    for (var x = 0; x < sw; x++) {
                        var so = y * sw + x;
                        var a = 0;
                        for (var cy = 0; cy < side; cy++) {
                            for (var cx = 0; cx < side; cx++) {
                                var scy = y + cy - halfSide;
                                var scx = x + cx - halfSide;
                                if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                                    var srcOff = scy * sw + scx;
                                    var wt = weights[cy * side + cx];
                                    a += mask[srcOff] * wt;
                                }
                            }
                        }
                        maskResult[so] = a >= 255 * 4 ? 255 : 0;
                    }
                }
                return maskResult;
            }
            function smoothEdgeMask(mask, sw, sh) {
                var weights = [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9];
                var side = Math.round(Math.sqrt(weights.length));
                var halfSide = Math.floor(side / 2);
                var maskResult = [];
                for (var y = 0; y < sh; y++) {
                    for (var x = 0; x < sw; x++) {
                        var so = y * sw + x;
                        var a = 0;
                        for (var cy = 0; cy < side; cy++) {
                            for (var cx = 0; cx < side; cx++) {
                                var scy = y + cy - halfSide;
                                var scx = x + cx - halfSide;
                                if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                                    var srcOff = scy * sw + scx;
                                    var wt = weights[cy * side + cx];
                                    a += mask[srcOff] * wt;
                                }
                            }
                        }
                        maskResult[so] = a;
                    }
                }
                return maskResult;
            }
            const Mask = function (imageData) {
                var threshold = this.threshold(), mask = backgroundMask(imageData, threshold);
                if (mask) {
                    mask = erodeMask(mask, imageData.width, imageData.height);
                    mask = dilateMask(mask, imageData.width, imageData.height);
                    mask = smoothEdgeMask(mask, imageData.width, imageData.height);
                    applyMask(imageData, mask);
                }
                return imageData;
            };
            Factory.addGetterSetter(Node, 'threshold', 0, getNumberValidator(), Factory.afterSetFilter);

            const Noise = function (imageData) {
                var amount = this.noise() * 255, data = imageData.data, nPixels = data.length, half = amount / 2, i;
                for (i = 0; i < nPixels; i += 4) {
                    data[i + 0] += half - 2 * half * Math.random();
                    data[i + 1] += half - 2 * half * Math.random();
                    data[i + 2] += half - 2 * half * Math.random();
                }
            };
            Factory.addGetterSetter(Node, 'noise', 0.2, getNumberValidator(), Factory.afterSetFilter);

            const Pixelate = function (imageData) {
                var pixelSize = Math.ceil(this.pixelSize()), width = imageData.width, height = imageData.height, x, y, i, red, green, blue, alpha, nBinsX = Math.ceil(width / pixelSize), nBinsY = Math.ceil(height / pixelSize), xBinStart, xBinEnd, yBinStart, yBinEnd, xBin, yBin, pixelsInBin, data = imageData.data;
                if (pixelSize <= 0) {
                    Util.error('pixelSize value can not be <= 0');
                    return;
                }
                for (xBin = 0; xBin < nBinsX; xBin += 1) {
                    for (yBin = 0; yBin < nBinsY; yBin += 1) {
                        red = 0;
                        green = 0;
                        blue = 0;
                        alpha = 0;
                        xBinStart = xBin * pixelSize;
                        xBinEnd = xBinStart + pixelSize;
                        yBinStart = yBin * pixelSize;
                        yBinEnd = yBinStart + pixelSize;
                        pixelsInBin = 0;
                        for (x = xBinStart; x < xBinEnd; x += 1) {
                            if (x >= width) {
                                continue;
                            }
                            for (y = yBinStart; y < yBinEnd; y += 1) {
                                if (y >= height) {
                                    continue;
                                }
                                i = (width * y + x) * 4;
                                red += data[i + 0];
                                green += data[i + 1];
                                blue += data[i + 2];
                                alpha += data[i + 3];
                                pixelsInBin += 1;
                            }
                        }
                        red = red / pixelsInBin;
                        green = green / pixelsInBin;
                        blue = blue / pixelsInBin;
                        alpha = alpha / pixelsInBin;
                        for (x = xBinStart; x < xBinEnd; x += 1) {
                            if (x >= width) {
                                continue;
                            }
                            for (y = yBinStart; y < yBinEnd; y += 1) {
                                if (y >= height) {
                                    continue;
                                }
                                i = (width * y + x) * 4;
                                data[i + 0] = red;
                                data[i + 1] = green;
                                data[i + 2] = blue;
                                data[i + 3] = alpha;
                            }
                        }
                    }
                }
            };
            Factory.addGetterSetter(Node, 'pixelSize', 8, getNumberValidator(), Factory.afterSetFilter);

            const Posterize = function (imageData) {
                var levels = Math.round(this.levels() * 254) + 1, data = imageData.data, len = data.length, scale = 255 / levels, i;
                for (i = 0; i < len; i += 1) {
                    data[i] = Math.floor(data[i] / scale) * scale;
                }
            };
            Factory.addGetterSetter(Node, 'levels', 0.5, getNumberValidator(), Factory.afterSetFilter);

            const RGB = function (imageData) {
                var data = imageData.data, nPixels = data.length, red = this.red(), green = this.green(), blue = this.blue(), i, brightness;
                for (i = 0; i < nPixels; i += 4) {
                    brightness =
                        (0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2]) / 255;
                    data[i] = brightness * red;
                    data[i + 1] = brightness * green;
                    data[i + 2] = brightness * blue;
                    data[i + 3] = data[i + 3];
                }
            };
            Factory.addGetterSetter(Node, 'red', 0, function (val) {
                this._filterUpToDate = false;
                if (val > 255) {
                    return 255;
                }
                else if (val < 0) {
                    return 0;
                }
                else {
                    return Math.round(val);
                }
            });
            Factory.addGetterSetter(Node, 'green', 0, function (val) {
                this._filterUpToDate = false;
                if (val > 255) {
                    return 255;
                }
                else if (val < 0) {
                    return 0;
                }
                else {
                    return Math.round(val);
                }
            });
            Factory.addGetterSetter(Node, 'blue', 0, RGBComponent, Factory.afterSetFilter);

            const RGBA = function (imageData) {
                var data = imageData.data, nPixels = data.length, red = this.red(), green = this.green(), blue = this.blue(), alpha = this.alpha(), i, ia;
                for (i = 0; i < nPixels; i += 4) {
                    ia = 1 - alpha;
                    data[i] = red * alpha + data[i] * ia;
                    data[i + 1] = green * alpha + data[i + 1] * ia;
                    data[i + 2] = blue * alpha + data[i + 2] * ia;
                }
            };
            Factory.addGetterSetter(Node, 'red', 0, function (val) {
                this._filterUpToDate = false;
                if (val > 255) {
                    return 255;
                }
                else if (val < 0) {
                    return 0;
                }
                else {
                    return Math.round(val);
                }
            });
            Factory.addGetterSetter(Node, 'green', 0, function (val) {
                this._filterUpToDate = false;
                if (val > 255) {
                    return 255;
                }
                else if (val < 0) {
                    return 0;
                }
                else {
                    return Math.round(val);
                }
            });
            Factory.addGetterSetter(Node, 'blue', 0, RGBComponent, Factory.afterSetFilter);
            Factory.addGetterSetter(Node, 'alpha', 1, function (val) {
                this._filterUpToDate = false;
                if (val > 1) {
                    return 1;
                }
                else if (val < 0) {
                    return 0;
                }
                else {
                    return val;
                }
            });

            const Sepia = function (imageData) {
                var data = imageData.data, nPixels = data.length, i, r, g, b;
                for (i = 0; i < nPixels; i += 4) {
                    r = data[i + 0];
                    g = data[i + 1];
                    b = data[i + 2];
                    data[i + 0] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
                    data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
                    data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
                }
            };

            const Solarize = function (imageData) {
                var data = imageData.data, w = imageData.width, h = imageData.height, w4 = w * 4, y = h;
                do {
                    var offsetY = (y - 1) * w4;
                    var x = w;
                    do {
                        var offset = offsetY + (x - 1) * 4;
                        var r = data[offset];
                        var g = data[offset + 1];
                        var b = data[offset + 2];
                        if (r > 127) {
                            r = 255 - r;
                        }
                        if (g > 127) {
                            g = 255 - g;
                        }
                        if (b > 127) {
                            b = 255 - b;
                        }
                        data[offset] = r;
                        data[offset + 1] = g;
                        data[offset + 2] = b;
                    } while (--x);
                } while (--y);
            };

            const Threshold = function (imageData) {
                var level = this.threshold() * 255, data = imageData.data, len = data.length, i;
                for (i = 0; i < len; i += 1) {
                    data[i] = data[i] < level ? 0 : 255;
                }
            };
            Factory.addGetterSetter(Node, 'threshold', 0.5, getNumberValidator(), Factory.afterSetFilter);

            const Konva = Konva$1.Util._assign(Konva$1, {
                Arc,
                Arrow,
                Circle,
                Ellipse,
                Image,
                Label,
                Tag,
                Line: Line$2,
                Path,
                Rect: Rect$3,
                RegularPolygon,
                Ring,
                Sprite,
                Star,
                Text,
                TextPath,
                Transformer,
                Wedge,
                Filters: {
                    Blur,
                    Brighten,
                    Contrast,
                    Emboss,
                    Enhance,
                    Grayscale,
                    HSL,
                    HSV,
                    Invert,
                    Kaleidoscope,
                    Mask,
                    Noise,
                    Pixelate,
                    Posterize,
                    RGB,
                    RGBA,
                    Sepia,
                    Solarize,
                    Threshold,
                },
            });

            /**
             * lil-gui
             * https://lil-gui.georgealways.com
             * @version 0.18.1
             * @author George Michael Brower
             * @license MIT
             */

            /**
             * Base class for all controllers.
             */
            class Controller {

            	constructor( parent, object, property, className, widgetTag = 'div' ) {

            		/**
            		 * The GUI that contains this controller.
            		 * @type {GUI}
            		 */
            		this.parent = parent;

            		/**
            		 * The object this controller will modify.
            		 * @type {object}
            		 */
            		this.object = object;

            		/**
            		 * The name of the property to control.
            		 * @type {string}
            		 */
            		this.property = property;

            		/**
            		 * Used to determine if the controller is disabled.
            		 * Use `controller.disable( true|false )` to modify this value
            		 * @type {boolean}
            		 */
            		this._disabled = false;

            		/**
            		 * Used to determine if the Controller is hidden.
            		 * Use `controller.show()` or `controller.hide()` to change this.
            		 * @type {boolean}
            		 */
            		this._hidden = false;

            		/**
            		 * The value of `object[ property ]` when the controller was created.
            		 * @type {any}
            		 */
            		this.initialValue = this.getValue();

            		/**
            		 * The outermost container DOM element for this controller.
            		 * @type {HTMLElement}
            		 */
            		this.domElement = document.createElement( 'div' );
            		this.domElement.classList.add( 'controller' );
            		this.domElement.classList.add( className );

            		/**
            		 * The DOM element that contains the controller's name.
            		 * @type {HTMLElement}
            		 */
            		this.$name = document.createElement( 'div' );
            		this.$name.classList.add( 'name' );

            		Controller.nextNameID = Controller.nextNameID || 0;
            		this.$name.id = `lil-gui-name-${++Controller.nextNameID}`;

            		/**
            		 * The DOM element that contains the controller's "widget" (which differs by controller type).
            		 * @type {HTMLElement}
            		 */
            		this.$widget = document.createElement( widgetTag );
            		this.$widget.classList.add( 'widget' );

            		/**
            		 * The DOM element that receives the disabled attribute when using disable()
            		 * @type {HTMLElement}
            		 */
            		this.$disable = this.$widget;

            		this.domElement.appendChild( this.$name );
            		this.domElement.appendChild( this.$widget );

            		this.parent.children.push( this );
            		this.parent.controllers.push( this );

            		this.parent.$children.appendChild( this.domElement );

            		this._listenCallback = this._listenCallback.bind( this );

            		this.name( property );

            	}

            	/**
            	 * Sets the name of the controller and its label in the GUI.
            	 * @param {string} name
            	 * @returns {this}
            	 */
            	name( name ) {
            		/**
            		 * The controller's name. Use `controller.name( 'Name' )` to modify this value.
            		 * @type {string}
            		 */
            		this._name = name;
            		this.$name.innerHTML = name;
            		return this;
            	}

            	/**
            	 * Pass a function to be called whenever the value is modified by this controller.
            	 * The function receives the new value as its first parameter. The value of `this` will be the
            	 * controller.
            	 *
            	 * For function controllers, the `onChange` callback will be fired on click, after the function
            	 * executes.
            	 * @param {Function} callback
            	 * @returns {this}
            	 * @example
            	 * const controller = gui.add( object, 'property' );
            	 *
            	 * controller.onChange( function( v ) {
            	 * 	console.log( 'The value is now ' + v );
            	 * 	console.assert( this === controller );
            	 * } );
            	 */
            	onChange( callback ) {
            		/**
            		 * Used to access the function bound to `onChange` events. Don't modify this value directly.
            		 * Use the `controller.onChange( callback )` method instead.
            		 * @type {Function}
            		 */
            		this._onChange = callback;
            		return this;
            	}

            	/**
            	 * Calls the onChange methods of this controller and its parent GUI.
            	 * @protected
            	 */
            	_callOnChange() {

            		this.parent._callOnChange( this );

            		if ( this._onChange !== undefined ) {
            			this._onChange.call( this, this.getValue() );
            		}

            		this._changed = true;

            	}

            	/**
            	 * Pass a function to be called after this controller has been modified and loses focus.
            	 * @param {Function} callback
            	 * @returns {this}
            	 * @example
            	 * const controller = gui.add( object, 'property' );
            	 *
            	 * controller.onFinishChange( function( v ) {
            	 * 	console.log( 'Changes complete: ' + v );
            	 * 	console.assert( this === controller );
            	 * } );
            	 */
            	onFinishChange( callback ) {
            		/**
            		 * Used to access the function bound to `onFinishChange` events. Don't modify this value
            		 * directly. Use the `controller.onFinishChange( callback )` method instead.
            		 * @type {Function}
            		 */
            		this._onFinishChange = callback;
            		return this;
            	}

            	/**
            	 * Should be called by Controller when its widgets lose focus.
            	 * @protected
            	 */
            	_callOnFinishChange() {

            		if ( this._changed ) {

            			this.parent._callOnFinishChange( this );

            			if ( this._onFinishChange !== undefined ) {
            				this._onFinishChange.call( this, this.getValue() );
            			}

            		}

            		this._changed = false;

            	}

            	/**
            	 * Sets the controller back to its initial value.
            	 * @returns {this}
            	 */
            	reset() {
            		this.setValue( this.initialValue );
            		this._callOnFinishChange();
            		return this;
            	}

            	/**
            	 * Enables this controller.
            	 * @param {boolean} enabled
            	 * @returns {this}
            	 * @example
            	 * controller.enable();
            	 * controller.enable( false ); // disable
            	 * controller.enable( controller._disabled ); // toggle
            	 */
            	enable( enabled = true ) {
            		return this.disable( !enabled );
            	}

            	/**
            	 * Disables this controller.
            	 * @param {boolean} disabled
            	 * @returns {this}
            	 * @example
            	 * controller.disable();
            	 * controller.disable( false ); // enable
            	 * controller.disable( !controller._disabled ); // toggle
            	 */
            	disable( disabled = true ) {

            		if ( disabled === this._disabled ) return this;

            		this._disabled = disabled;

            		this.domElement.classList.toggle( 'disabled', disabled );
            		this.$disable.toggleAttribute( 'disabled', disabled );

            		return this;

            	}

            	/**
            	 * Shows the Controller after it's been hidden.
            	 * @param {boolean} show
            	 * @returns {this}
            	 * @example
            	 * controller.show();
            	 * controller.show( false ); // hide
            	 * controller.show( controller._hidden ); // toggle
            	 */
            	show( show = true ) {

            		this._hidden = !show;

            		this.domElement.style.display = this._hidden ? 'none' : '';

            		return this;

            	}

            	/**
            	 * Hides the Controller.
            	 * @returns {this}
            	 */
            	hide() {
            		return this.show( false );
            	}

            	/**
            	 * Destroys this controller and replaces it with a new option controller. Provided as a more
            	 * descriptive syntax for `gui.add`, but primarily for compatibility with dat.gui.
            	 *
            	 * Use caution, as this method will destroy old references to this controller. It will also
            	 * change controller order if called out of sequence, moving the option controller to the end of
            	 * the GUI.
            	 * @example
            	 * // safe usage
            	 *
            	 * gui.add( object1, 'property' ).options( [ 'a', 'b', 'c' ] );
            	 * gui.add( object2, 'property' );
            	 *
            	 * // danger
            	 *
            	 * const c = gui.add( object1, 'property' );
            	 * gui.add( object2, 'property' );
            	 *
            	 * c.options( [ 'a', 'b', 'c' ] );
            	 * // controller is now at the end of the GUI even though it was added first
            	 *
            	 * assert( c.parent.children.indexOf( c ) === -1 )
            	 * // c references a controller that no longer exists
            	 *
            	 * @param {object|Array} options
            	 * @returns {Controller}
            	 */
            	options( options ) {
            		const controller = this.parent.add( this.object, this.property, options );
            		controller.name( this._name );
            		this.destroy();
            		return controller;
            	}

            	/**
            	 * Sets the minimum value. Only works on number controllers.
            	 * @param {number} min
            	 * @returns {this}
            	 */
            	min( min ) {
            		return this;
            	}

            	/**
            	 * Sets the maximum value. Only works on number controllers.
            	 * @param {number} max
            	 * @returns {this}
            	 */
            	max( max ) {
            		return this;
            	}

            	/**
            	 * Values set by this controller will be rounded to multiples of `step`. Only works on number
            	 * controllers.
            	 * @param {number} step
            	 * @returns {this}
            	 */
            	step( step ) {
            		return this;
            	}

            	/**
            	 * Rounds the displayed value to a fixed number of decimals, without affecting the actual value
            	 * like `step()`. Only works on number controllers.
            	 * @example
            	 * gui.add( object, 'property' ).listen().decimals( 4 );
            	 * @param {number} decimals
            	 * @returns {this}
            	 */
            	decimals( decimals ) {
            		return this;
            	}

            	/**
            	 * Calls `updateDisplay()` every animation frame. Pass `false` to stop listening.
            	 * @param {boolean} listen
            	 * @returns {this}
            	 */
            	listen( listen = true ) {

            		/**
            		 * Used to determine if the controller is currently listening. Don't modify this value
            		 * directly. Use the `controller.listen( true|false )` method instead.
            		 * @type {boolean}
            		 */
            		this._listening = listen;

            		if ( this._listenCallbackID !== undefined ) {
            			cancelAnimationFrame( this._listenCallbackID );
            			this._listenCallbackID = undefined;
            		}

            		if ( this._listening ) {
            			this._listenCallback();
            		}

            		return this;

            	}

            	_listenCallback() {

            		this._listenCallbackID = requestAnimationFrame( this._listenCallback );

            		// To prevent framerate loss, make sure the value has changed before updating the display.
            		// Note: save() is used here instead of getValue() only because of ColorController. The !== operator
            		// won't work for color objects or arrays, but ColorController.save() always returns a string.

            		const curValue = this.save();

            		if ( curValue !== this._listenPrevValue ) {
            			this.updateDisplay();
            		}

            		this._listenPrevValue = curValue;

            	}

            	/**
            	 * Returns `object[ property ]`.
            	 * @returns {any}
            	 */
            	getValue() {
            		return this.object[ this.property ];
            	}

            	/**
            	 * Sets the value of `object[ property ]`, invokes any `onChange` handlers and updates the display.
            	 * @param {any} value
            	 * @returns {this}
            	 */
            	setValue( value ) {
            		this.object[ this.property ] = value;
            		this._callOnChange();
            		this.updateDisplay();
            		return this;
            	}

            	/**
            	 * Updates the display to keep it in sync with the current value. Useful for updating your
            	 * controllers when their values have been modified outside of the GUI.
            	 * @returns {this}
            	 */
            	updateDisplay() {
            		return this;
            	}

            	load( value ) {
            		this.setValue( value );
            		this._callOnFinishChange();
            		return this;
            	}

            	save() {
            		return this.getValue();
            	}

            	/**
            	 * Destroys this controller and removes it from the parent GUI.
            	 */
            	destroy() {
            		this.listen( false );
            		this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
            		this.parent.controllers.splice( this.parent.controllers.indexOf( this ), 1 );
            		this.parent.$children.removeChild( this.domElement );
            	}

            }

            class BooleanController extends Controller {

            	constructor( parent, object, property ) {

            		super( parent, object, property, 'boolean', 'label' );

            		this.$input = document.createElement( 'input' );
            		this.$input.setAttribute( 'type', 'checkbox' );
            		this.$input.setAttribute( 'aria-labelledby', this.$name.id );

            		this.$widget.appendChild( this.$input );

            		this.$input.addEventListener( 'change', () => {
            			this.setValue( this.$input.checked );
            			this._callOnFinishChange();
            		} );

            		this.$disable = this.$input;

            		this.updateDisplay();

            	}

            	updateDisplay() {
            		this.$input.checked = this.getValue();
            		return this;
            	}

            }

            function normalizeColorString( string ) {

            	let match, result;

            	if ( match = string.match( /(#|0x)?([a-f0-9]{6})/i ) ) {

            		result = match[ 2 ];

            	} else if ( match = string.match( /rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/ ) ) {

            		result = parseInt( match[ 1 ] ).toString( 16 ).padStart( 2, 0 )
            			+ parseInt( match[ 2 ] ).toString( 16 ).padStart( 2, 0 )
            			+ parseInt( match[ 3 ] ).toString( 16 ).padStart( 2, 0 );

            	} else if ( match = string.match( /^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i ) ) {

            		result = match[ 1 ] + match[ 1 ] + match[ 2 ] + match[ 2 ] + match[ 3 ] + match[ 3 ];

            	}

            	if ( result ) {
            		return '#' + result;
            	}

            	return false;

            }

            const STRING = {
            	isPrimitive: true,
            	match: v => typeof v === 'string',
            	fromHexString: normalizeColorString,
            	toHexString: normalizeColorString
            };

            const INT = {
            	isPrimitive: true,
            	match: v => typeof v === 'number',
            	fromHexString: string => parseInt( string.substring( 1 ), 16 ),
            	toHexString: value => '#' + value.toString( 16 ).padStart( 6, 0 )
            };

            const ARRAY = {
            	isPrimitive: false,
            	
            	// The arrow function is here to appease tree shakers like esbuild or webpack.
            	// See https://esbuild.github.io/api/#tree-shaking
            	match: v => Array.isArray( v ),
            	
            	fromHexString( string, target, rgbScale = 1 ) {

            		const int = INT.fromHexString( string );

            		target[ 0 ] = ( int >> 16 & 255 ) / 255 * rgbScale;
            		target[ 1 ] = ( int >> 8 & 255 ) / 255 * rgbScale;
            		target[ 2 ] = ( int & 255 ) / 255 * rgbScale;

            	},
            	toHexString( [ r, g, b ], rgbScale = 1 ) {

            		rgbScale = 255 / rgbScale;

            		const int = ( r * rgbScale ) << 16 ^
            			( g * rgbScale ) << 8 ^
            			( b * rgbScale ) << 0;

            		return INT.toHexString( int );

            	}
            };

            const OBJECT = {
            	isPrimitive: false,
            	match: v => Object( v ) === v,
            	fromHexString( string, target, rgbScale = 1 ) {

            		const int = INT.fromHexString( string );

            		target.r = ( int >> 16 & 255 ) / 255 * rgbScale;
            		target.g = ( int >> 8 & 255 ) / 255 * rgbScale;
            		target.b = ( int & 255 ) / 255 * rgbScale;

            	},
            	toHexString( { r, g, b }, rgbScale = 1 ) {

            		rgbScale = 255 / rgbScale;

            		const int = ( r * rgbScale ) << 16 ^
            			( g * rgbScale ) << 8 ^
            			( b * rgbScale ) << 0;

            		return INT.toHexString( int );

            	}
            };

            const FORMATS = [ STRING, INT, ARRAY, OBJECT ];

            function getColorFormat( value ) {
            	return FORMATS.find( format => format.match( value ) );
            }

            class ColorController extends Controller {

            	constructor( parent, object, property, rgbScale ) {

            		super( parent, object, property, 'color' );

            		this.$input = document.createElement( 'input' );
            		this.$input.setAttribute( 'type', 'color' );
            		this.$input.setAttribute( 'tabindex', -1 );
            		this.$input.setAttribute( 'aria-labelledby', this.$name.id );

            		this.$text = document.createElement( 'input' );
            		this.$text.setAttribute( 'type', 'text' );
            		this.$text.setAttribute( 'spellcheck', 'false' );
            		this.$text.setAttribute( 'aria-labelledby', this.$name.id );

            		this.$display = document.createElement( 'div' );
            		this.$display.classList.add( 'display' );

            		this.$display.appendChild( this.$input );
            		this.$widget.appendChild( this.$display );
            		this.$widget.appendChild( this.$text );

            		this._format = getColorFormat( this.initialValue );
            		this._rgbScale = rgbScale;

            		this._initialValueHexString = this.save();
            		this._textFocused = false;

            		this.$input.addEventListener( 'input', () => {
            			this._setValueFromHexString( this.$input.value );
            		} );

            		this.$input.addEventListener( 'blur', () => {
            			this._callOnFinishChange();
            		} );

            		this.$text.addEventListener( 'input', () => {
            			const tryParse = normalizeColorString( this.$text.value );
            			if ( tryParse ) {
            				this._setValueFromHexString( tryParse );
            			}
            		} );

            		this.$text.addEventListener( 'focus', () => {
            			this._textFocused = true;
            			this.$text.select();
            		} );

            		this.$text.addEventListener( 'blur', () => {
            			this._textFocused = false;
            			this.updateDisplay();
            			this._callOnFinishChange();
            		} );

            		this.$disable = this.$text;

            		this.updateDisplay();

            	}

            	reset() {
            		this._setValueFromHexString( this._initialValueHexString );
            		return this;
            	}

            	_setValueFromHexString( value ) {

            		if ( this._format.isPrimitive ) {

            			const newValue = this._format.fromHexString( value );
            			this.setValue( newValue );

            		} else {

            			this._format.fromHexString( value, this.getValue(), this._rgbScale );
            			this._callOnChange();
            			this.updateDisplay();

            		}

            	}

            	save() {
            		return this._format.toHexString( this.getValue(), this._rgbScale );
            	}

            	load( value ) {
            		this._setValueFromHexString( value );
            		this._callOnFinishChange();
            		return this;
            	}

            	updateDisplay() {
            		this.$input.value = this._format.toHexString( this.getValue(), this._rgbScale );
            		if ( !this._textFocused ) {
            			this.$text.value = this.$input.value.substring( 1 );
            		}
            		this.$display.style.backgroundColor = this.$input.value;
            		return this;
            	}

            }

            class FunctionController extends Controller {

            	constructor( parent, object, property ) {

            		super( parent, object, property, 'function' );

            		// Buttons are the only case where widget contains name
            		this.$button = document.createElement( 'button' );
            		this.$button.appendChild( this.$name );
            		this.$widget.appendChild( this.$button );

            		this.$button.addEventListener( 'click', e => {
            			e.preventDefault();
            			this.getValue().call( this.object );
            			this._callOnChange();
            		} );

            		// enables :active pseudo class on mobile
            		this.$button.addEventListener( 'touchstart', () => {}, { passive: true } );

            		this.$disable = this.$button;

            	}

            }

            class NumberController extends Controller {

            	constructor( parent, object, property, min, max, step ) {

            		super( parent, object, property, 'number' );

            		this._initInput();

            		this.min( min );
            		this.max( max );

            		const stepExplicit = step !== undefined;
            		this.step( stepExplicit ? step : this._getImplicitStep(), stepExplicit );

            		this.updateDisplay();

            	}

            	decimals( decimals ) {
            		this._decimals = decimals;
            		this.updateDisplay();
            		return this;
            	}

            	min( min ) {
            		this._min = min;
            		this._onUpdateMinMax();
            		return this;
            	}

            	max( max ) {
            		this._max = max;
            		this._onUpdateMinMax();
            		return this;
            	}

            	step( step, explicit = true ) {
            		this._step = step;
            		this._stepExplicit = explicit;
            		return this;
            	}

            	updateDisplay() {

            		const value = this.getValue();

            		if ( this._hasSlider ) {

            			let percent = ( value - this._min ) / ( this._max - this._min );
            			percent = Math.max( 0, Math.min( percent, 1 ) );

            			this.$fill.style.width = percent * 100 + '%';

            		}

            		if ( !this._inputFocused ) {
            			this.$input.value = this._decimals === undefined ? value : value.toFixed( this._decimals );
            		}

            		return this;

            	}

            	_initInput() {

            		this.$input = document.createElement( 'input' );
            		this.$input.setAttribute( 'type', 'number' );
            		this.$input.setAttribute( 'step', 'any' );
            		this.$input.setAttribute( 'aria-labelledby', this.$name.id );

            		this.$widget.appendChild( this.$input );

            		this.$disable = this.$input;

            		const onInput = () => {

            			let value = parseFloat( this.$input.value );

            			if ( isNaN( value ) ) return;

            			if ( this._stepExplicit ) {
            				value = this._snap( value );
            			}

            			this.setValue( this._clamp( value ) );

            		};

            		// Keys & mouse wheel
            		// ---------------------------------------------------------------------

            		const increment = delta => {

            			const value = parseFloat( this.$input.value );

            			if ( isNaN( value ) ) return;

            			this._snapClampSetValue( value + delta );

            			// Force the input to updateDisplay when it's focused
            			this.$input.value = this.getValue();

            		};

            		const onKeyDown = e => {
            			if ( e.code === 'Enter' ) {
            				this.$input.blur();
            			}
            			if ( e.code === 'ArrowUp' ) {
            				e.preventDefault();
            				increment( this._step * this._arrowKeyMultiplier( e ) );
            			}
            			if ( e.code === 'ArrowDown' ) {
            				e.preventDefault();
            				increment( this._step * this._arrowKeyMultiplier( e ) * -1 );
            			}
            		};

            		const onWheel = e => {
            			if ( this._inputFocused ) {
            				e.preventDefault();
            				increment( this._step * this._normalizeMouseWheel( e ) );
            			}
            		};

            		// Vertical drag
            		// ---------------------------------------------------------------------

            		let testingForVerticalDrag = false,
            			initClientX,
            			initClientY,
            			prevClientY,
            			initValue,
            			dragDelta;

            		// Once the mouse is dragged more than DRAG_THRESH px on any axis, we decide
            		// on the user's intent: horizontal means highlight, vertical means drag.
            		const DRAG_THRESH = 5;

            		const onMouseDown = e => {

            			initClientX = e.clientX;
            			initClientY = prevClientY = e.clientY;
            			testingForVerticalDrag = true;

            			initValue = this.getValue();
            			dragDelta = 0;

            			window.addEventListener( 'mousemove', onMouseMove );
            			window.addEventListener( 'mouseup', onMouseUp );

            		};

            		const onMouseMove = e => {

            			if ( testingForVerticalDrag ) {

            				const dx = e.clientX - initClientX;
            				const dy = e.clientY - initClientY;

            				if ( Math.abs( dy ) > DRAG_THRESH ) {

            					e.preventDefault();
            					this.$input.blur();
            					testingForVerticalDrag = false;
            					this._setDraggingStyle( true, 'vertical' );

            				} else if ( Math.abs( dx ) > DRAG_THRESH ) {

            					onMouseUp();

            				}

            			}

            			// This isn't an else so that the first move counts towards dragDelta
            			if ( !testingForVerticalDrag ) {

            				const dy = e.clientY - prevClientY;

            				dragDelta -= dy * this._step * this._arrowKeyMultiplier( e );

            				// Clamp dragDelta so we don't have 'dead space' after dragging past bounds.
            				// We're okay with the fact that bounds can be undefined here.
            				if ( initValue + dragDelta > this._max ) {
            					dragDelta = this._max - initValue;
            				} else if ( initValue + dragDelta < this._min ) {
            					dragDelta = this._min - initValue;
            				}

            				this._snapClampSetValue( initValue + dragDelta );

            			}

            			prevClientY = e.clientY;

            		};

            		const onMouseUp = () => {
            			this._setDraggingStyle( false, 'vertical' );
            			this._callOnFinishChange();
            			window.removeEventListener( 'mousemove', onMouseMove );
            			window.removeEventListener( 'mouseup', onMouseUp );
            		};

            		// Focus state & onFinishChange
            		// ---------------------------------------------------------------------

            		const onFocus = () => {
            			this._inputFocused = true;
            		};

            		const onBlur = () => {
            			this._inputFocused = false;
            			this.updateDisplay();
            			this._callOnFinishChange();
            		};

            		this.$input.addEventListener( 'input', onInput );
            		this.$input.addEventListener( 'keydown', onKeyDown );
            		this.$input.addEventListener( 'wheel', onWheel, { passive: false } );
            		this.$input.addEventListener( 'mousedown', onMouseDown );
            		this.$input.addEventListener( 'focus', onFocus );
            		this.$input.addEventListener( 'blur', onBlur );

            	}

            	_initSlider() {

            		this._hasSlider = true;

            		// Build DOM
            		// ---------------------------------------------------------------------

            		this.$slider = document.createElement( 'div' );
            		this.$slider.classList.add( 'slider' );

            		this.$fill = document.createElement( 'div' );
            		this.$fill.classList.add( 'fill' );

            		this.$slider.appendChild( this.$fill );
            		this.$widget.insertBefore( this.$slider, this.$input );

            		this.domElement.classList.add( 'hasSlider' );

            		// Map clientX to value
            		// ---------------------------------------------------------------------

            		const map = ( v, a, b, c, d ) => {
            			return ( v - a ) / ( b - a ) * ( d - c ) + c;
            		};

            		const setValueFromX = clientX => {
            			const rect = this.$slider.getBoundingClientRect();
            			let value = map( clientX, rect.left, rect.right, this._min, this._max );
            			this._snapClampSetValue( value );
            		};

            		// Mouse drag
            		// ---------------------------------------------------------------------

            		const mouseDown = e => {
            			this._setDraggingStyle( true );
            			setValueFromX( e.clientX );
            			window.addEventListener( 'mousemove', mouseMove );
            			window.addEventListener( 'mouseup', mouseUp );
            		};

            		const mouseMove = e => {
            			setValueFromX( e.clientX );
            		};

            		const mouseUp = () => {
            			this._callOnFinishChange();
            			this._setDraggingStyle( false );
            			window.removeEventListener( 'mousemove', mouseMove );
            			window.removeEventListener( 'mouseup', mouseUp );
            		};

            		// Touch drag
            		// ---------------------------------------------------------------------

            		let testingForScroll = false, prevClientX, prevClientY;

            		const beginTouchDrag = e => {
            			e.preventDefault();
            			this._setDraggingStyle( true );
            			setValueFromX( e.touches[ 0 ].clientX );
            			testingForScroll = false;
            		};

            		const onTouchStart = e => {

            			if ( e.touches.length > 1 ) return;

            			// If we're in a scrollable container, we should wait for the first
            			// touchmove to see if the user is trying to slide or scroll.
            			if ( this._hasScrollBar ) {

            				prevClientX = e.touches[ 0 ].clientX;
            				prevClientY = e.touches[ 0 ].clientY;
            				testingForScroll = true;

            			} else {

            				// Otherwise, we can set the value straight away on touchstart.
            				beginTouchDrag( e );

            			}

            			window.addEventListener( 'touchmove', onTouchMove, { passive: false } );
            			window.addEventListener( 'touchend', onTouchEnd );

            		};

            		const onTouchMove = e => {

            			if ( testingForScroll ) {

            				const dx = e.touches[ 0 ].clientX - prevClientX;
            				const dy = e.touches[ 0 ].clientY - prevClientY;

            				if ( Math.abs( dx ) > Math.abs( dy ) ) {

            					// We moved horizontally, set the value and stop checking.
            					beginTouchDrag( e );

            				} else {

            					// This was, in fact, an attempt to scroll. Abort.
            					window.removeEventListener( 'touchmove', onTouchMove );
            					window.removeEventListener( 'touchend', onTouchEnd );

            				}

            			} else {

            				e.preventDefault();
            				setValueFromX( e.touches[ 0 ].clientX );

            			}

            		};

            		const onTouchEnd = () => {
            			this._callOnFinishChange();
            			this._setDraggingStyle( false );
            			window.removeEventListener( 'touchmove', onTouchMove );
            			window.removeEventListener( 'touchend', onTouchEnd );
            		};

            		// Mouse wheel
            		// ---------------------------------------------------------------------

            		// We have to use a debounced function to call onFinishChange because
            		// there's no way to tell when the user is "done" mouse-wheeling.
            		const callOnFinishChange = this._callOnFinishChange.bind( this );
            		const WHEEL_DEBOUNCE_TIME = 400;
            		let wheelFinishChangeTimeout;

            		const onWheel = e => {

            			// ignore vertical wheels if there's a scrollbar
            			const isVertical = Math.abs( e.deltaX ) < Math.abs( e.deltaY );
            			if ( isVertical && this._hasScrollBar ) return;

            			e.preventDefault();

            			// set value
            			const delta = this._normalizeMouseWheel( e ) * this._step;
            			this._snapClampSetValue( this.getValue() + delta );

            			// force the input to updateDisplay when it's focused
            			this.$input.value = this.getValue();

            			// debounce onFinishChange
            			clearTimeout( wheelFinishChangeTimeout );
            			wheelFinishChangeTimeout = setTimeout( callOnFinishChange, WHEEL_DEBOUNCE_TIME );

            		};

            		this.$slider.addEventListener( 'mousedown', mouseDown );
            		this.$slider.addEventListener( 'touchstart', onTouchStart, { passive: false } );
            		this.$slider.addEventListener( 'wheel', onWheel, { passive: false } );

            	}

            	_setDraggingStyle( active, axis = 'horizontal' ) {
            		if ( this.$slider ) {
            			this.$slider.classList.toggle( 'active', active );
            		}
            		document.body.classList.toggle( 'lil-gui-dragging', active );
            		document.body.classList.toggle( `lil-gui-${axis}`, active );
            	}

            	_getImplicitStep() {

            		if ( this._hasMin && this._hasMax ) {
            			return ( this._max - this._min ) / 1000;
            		}

            		return 0.1;

            	}

            	_onUpdateMinMax() {

            		if ( !this._hasSlider && this._hasMin && this._hasMax ) {

            			// If this is the first time we're hearing about min and max
            			// and we haven't explicitly stated what our step is, let's
            			// update that too.
            			if ( !this._stepExplicit ) {
            				this.step( this._getImplicitStep(), false );
            			}

            			this._initSlider();
            			this.updateDisplay();

            		}

            	}

            	_normalizeMouseWheel( e ) {

            		let { deltaX, deltaY } = e;

            		// Safari and Chrome report weird non-integral values for a notched wheel,
            		// but still expose actual lines scrolled via wheelDelta. Notched wheels
            		// should behave the same way as arrow keys.
            		if ( Math.floor( e.deltaY ) !== e.deltaY && e.wheelDelta ) {
            			deltaX = 0;
            			deltaY = -e.wheelDelta / 120;
            			deltaY *= this._stepExplicit ? 1 : 10;
            		}

            		const wheel = deltaX + -deltaY;

            		return wheel;

            	}

            	_arrowKeyMultiplier( e ) {

            		let mult = this._stepExplicit ? 1 : 10;

            		if ( e.shiftKey ) {
            			mult *= 10;
            		} else if ( e.altKey ) {
            			mult /= 10;
            		}

            		return mult;

            	}

            	_snap( value ) {

            		// This would be the logical way to do things, but floating point errors.
            		// return Math.round( value / this._step ) * this._step;

            		// Using inverse step solves a lot of them, but not all
            		// const inverseStep = 1 / this._step;
            		// return Math.round( value * inverseStep ) / inverseStep;

            		// Not happy about this, but haven't seen it break.
            		const r = Math.round( value / this._step ) * this._step;
            		return parseFloat( r.toPrecision( 15 ) );

            	}

            	_clamp( value ) {
            		// either condition is false if min or max is undefined
            		if ( value < this._min ) value = this._min;
            		if ( value > this._max ) value = this._max;
            		return value;
            	}

            	_snapClampSetValue( value ) {
            		this.setValue( this._clamp( this._snap( value ) ) );
            	}

            	get _hasScrollBar() {
            		const root = this.parent.root.$children;
            		return root.scrollHeight > root.clientHeight;
            	}

            	get _hasMin() {
            		return this._min !== undefined;
            	}

            	get _hasMax() {
            		return this._max !== undefined;
            	}

            }

            class OptionController extends Controller {

            	constructor( parent, object, property, options ) {

            		super( parent, object, property, 'option' );

            		this.$select = document.createElement( 'select' );
            		this.$select.setAttribute( 'aria-labelledby', this.$name.id );

            		this.$display = document.createElement( 'div' );
            		this.$display.classList.add( 'display' );

            		this._values = Array.isArray( options ) ? options : Object.values( options );
            		this._names = Array.isArray( options ) ? options : Object.keys( options );

            		this._names.forEach( name => {
            			const $option = document.createElement( 'option' );
            			$option.innerHTML = name;
            			this.$select.appendChild( $option );
            		} );

            		this.$select.addEventListener( 'change', () => {
            			this.setValue( this._values[ this.$select.selectedIndex ] );
            			this._callOnFinishChange();
            		} );

            		this.$select.addEventListener( 'focus', () => {
            			this.$display.classList.add( 'focus' );
            		} );

            		this.$select.addEventListener( 'blur', () => {
            			this.$display.classList.remove( 'focus' );
            		} );

            		this.$widget.appendChild( this.$select );
            		this.$widget.appendChild( this.$display );

            		this.$disable = this.$select;

            		this.updateDisplay();

            	}

            	updateDisplay() {
            		const value = this.getValue();
            		const index = this._values.indexOf( value );
            		this.$select.selectedIndex = index;
            		this.$display.innerHTML = index === -1 ? value : this._names[ index ];
            		return this;
            	}

            }

            class StringController extends Controller {

            	constructor( parent, object, property ) {

            		super( parent, object, property, 'string' );

            		this.$input = document.createElement( 'input' );
            		this.$input.setAttribute( 'type', 'text' );
            		this.$input.setAttribute( 'aria-labelledby', this.$name.id );

            		this.$input.addEventListener( 'input', () => {
            			this.setValue( this.$input.value );
            		} );

            		this.$input.addEventListener( 'keydown', e => {
            			if ( e.code === 'Enter' ) {
            				this.$input.blur();
            			}
            		} );

            		this.$input.addEventListener( 'blur', () => {
            			this._callOnFinishChange();
            		} );

            		this.$widget.appendChild( this.$input );

            		this.$disable = this.$input;

            		this.updateDisplay();

            	}

            	updateDisplay() {
            		this.$input.value = this.getValue();
            		return this;
            	}

            }

            const stylesheet = `.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  background-color: var(--background-color);
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
}
.lil-gui.root > .title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.root > .children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.root > .children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.root > .children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.allow-touch-styles {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.force-touch-styles {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-gui .controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-gui .controller.disabled {
  opacity: 0.5;
}
.lil-gui .controller.disabled, .lil-gui .controller.disabled * {
  pointer-events: none !important;
}
.lil-gui .controller > .name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-gui .controller .widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-gui .controller.string input {
  color: var(--string-color);
}
.lil-gui .controller.boolean .widget {
  cursor: pointer;
}
.lil-gui .controller.color .display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-gui .controller.color .display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-gui .controller.color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-gui .controller.color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-gui .controller.option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-gui .controller.option .display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-gui .controller.option .display.focus {
    background: var(--focus-color);
  }
}
.lil-gui .controller.option .display.active {
  background: var(--focus-color);
}
.lil-gui .controller.option .display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-gui .controller.option .widget,
.lil-gui .controller.option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-gui .controller.option .widget:hover .display {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number input {
  color: var(--number-color);
}
.lil-gui .controller.number.hasSlider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-gui .controller.number .slider {
  width: 100%;
  height: var(--widget-height);
  background-color: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-gui .controller.number .slider:hover {
    background-color: var(--hover-color);
  }
}
.lil-gui .controller.number .slider.active {
  background-color: var(--focus-color);
}
.lil-gui .controller.number .slider.active .fill {
  opacity: 0.95;
}
.lil-gui .controller.number .fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-gui-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-gui-dragging * {
  cursor: ew-resize !important;
}

.lil-gui-dragging.lil-gui-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .title {
  height: var(--title-height);
  line-height: calc(var(--title-height) - 4px);
  font-weight: 600;
  padding: 0 var(--padding);
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  outline: none;
  text-decoration-skip: objects;
}
.lil-gui .title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-gui-dragging) .lil-gui .title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.root > .title:focus {
  text-decoration: none !important;
}
.lil-gui.closed > .title:before {
  content: "▸";
}
.lil-gui.closed > .children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.closed:not(.transition) > .children {
  display: none;
}
.lil-gui.transition > .children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.root > .children > .lil-gui > .title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.root > .children > .lil-gui.closed > .title {
  border-bottom-color: transparent;
}
.lil-gui + .controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .controller {
  border: none;
}

.lil-gui input {
  -webkit-tap-highlight-color: transparent;
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input::-webkit-outer-spin-button,
.lil-gui input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.lil-gui input[type=number] {
  -moz-appearance: textfield;
}
.lil-gui input[type=checkbox] {
  appearance: none;
  -webkit-appearance: none;
  height: var(--checkbox-size);
  width: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  -webkit-tap-highlight-color: transparent;
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  border: 1px solid var(--widget-color);
  text-align: center;
  line-height: calc(var(--widget-height) - 4px);
}
@media (hover: hover) {
  .lil-gui button:hover {
    background: var(--hover-color);
    border-color: var(--hover-color);
  }
  .lil-gui button:focus {
    border-color: var(--focus-color);
  }
}
.lil-gui button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAUsAAsAAAAACJwAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAAH4AAADAImwmYE9TLzIAAAGIAAAAPwAAAGBKqH5SY21hcAAAAcgAAAD0AAACrukyyJBnbHlmAAACvAAAAF8AAACEIZpWH2hlYWQAAAMcAAAAJwAAADZfcj2zaGhlYQAAA0QAAAAYAAAAJAC5AHhobXR4AAADXAAAABAAAABMAZAAAGxvY2EAAANsAAAAFAAAACgCEgIybWF4cAAAA4AAAAAeAAAAIAEfABJuYW1lAAADoAAAASIAAAIK9SUU/XBvc3QAAATEAAAAZgAAAJCTcMc2eJxVjbEOgjAURU+hFRBK1dGRL+ALnAiToyMLEzFpnPz/eAshwSa97517c/MwwJmeB9kwPl+0cf5+uGPZXsqPu4nvZabcSZldZ6kfyWnomFY/eScKqZNWupKJO6kXN3K9uCVoL7iInPr1X5baXs3tjuMqCtzEuagm/AAlzQgPAAB4nGNgYRBlnMDAysDAYM/gBiT5oLQBAwuDJAMDEwMrMwNWEJDmmsJwgCFeXZghBcjlZMgFCzOiKOIFAB71Bb8AeJy1kjFuwkAQRZ+DwRAwBtNQRUGKQ8OdKCAWUhAgKLhIuAsVSpWz5Bbkj3dEgYiUIszqWdpZe+Z7/wB1oCYmIoboiwiLT2WjKl/jscrHfGg/pKdMkyklC5Zs2LEfHYpjcRoPzme9MWWmk3dWbK9ObkWkikOetJ554fWyoEsmdSlt+uR0pCJR34b6t/TVg1SY3sYvdf8vuiKrpyaDXDISiegp17p7579Gp3p++y7HPAiY9pmTibljrr85qSidtlg4+l25GLCaS8e6rRxNBmsnERunKbaOObRz7N72ju5vdAjYpBXHgJylOAVsMseDAPEP8LYoUHicY2BiAAEfhiAGJgZWBgZ7RnFRdnVJELCQlBSRlATJMoLV2DK4glSYs6ubq5vbKrJLSbGrgEmovDuDJVhe3VzcXFwNLCOILB/C4IuQ1xTn5FPilBTj5FPmBAB4WwoqAHicY2BkYGAA4sk1sR/j+W2+MnAzpDBgAyEMQUCSg4EJxAEAwUgFHgB4nGNgZGBgSGFggJMhDIwMqEAYAByHATJ4nGNgAIIUNEwmAABl3AGReJxjYAACIQYlBiMGJ3wQAEcQBEV4nGNgZGBgEGZgY2BiAAEQyQWEDAz/wXwGAAsPATIAAHicXdBNSsNAHAXwl35iA0UQXYnMShfS9GPZA7T7LgIu03SSpkwzYTIt1BN4Ak/gKTyAeCxfw39jZkjymzcvAwmAW/wgwHUEGDb36+jQQ3GXGot79L24jxCP4gHzF/EIr4jEIe7wxhOC3g2TMYy4Q7+Lu/SHuEd/ivt4wJd4wPxbPEKMX3GI5+DJFGaSn4qNzk8mcbKSR6xdXdhSzaOZJGtdapd4vVPbi6rP+cL7TGXOHtXKll4bY1Xl7EGnPtp7Xy2n00zyKLVHfkHBa4IcJ2oD3cgggWvt/V/FbDrUlEUJhTn/0azVWbNTNr0Ens8de1tceK9xZmfB1CPjOmPH4kitmvOubcNpmVTN3oFJyjzCvnmrwhJTzqzVj9jiSX911FjeAAB4nG3HMRKCMBBA0f0giiKi4DU8k0V2GWbIZDOh4PoWWvq6J5V8If9NVNQcaDhyouXMhY4rPTcG7jwYmXhKq8Wz+p762aNaeYXom2n3m2dLTVgsrCgFJ7OTmIkYbwIbC6vIB7WmFfAAAA==") format("woff");
}`;

            function _injectStyles( cssContent ) {
            	const injected = document.createElement( 'style' );
            	injected.innerHTML = cssContent;
            	const before = document.querySelector( 'head link[rel=stylesheet], head style' );
            	if ( before ) {
            		document.head.insertBefore( injected, before );
            	} else {
            		document.head.appendChild( injected );
            	}
            }

            let stylesInjected = false;

            class GUI {

            	/**
            	 * Creates a panel that holds controllers.
            	 * @example
            	 * new GUI();
            	 * new GUI( { container: document.getElementById( 'custom' ) } );
            	 *
            	 * @param {object} [options]
            	 * @param {boolean} [options.autoPlace=true]
            	 * Adds the GUI to `document.body` and fixes it to the top right of the page.
            	 *
            	 * @param {HTMLElement} [options.container]
            	 * Adds the GUI to this DOM element. Overrides `autoPlace`.
            	 *
            	 * @param {number} [options.width=245]
            	 * Width of the GUI in pixels, usually set when name labels become too long. Note that you can make
            	 * name labels wider in CSS with `.lil‑gui { ‑‑name‑width: 55% }`
            	 *
            	 * @param {string} [options.title=Controls]
            	 * Name to display in the title bar.
            	 *
            	 * @param {boolean} [options.closeFolders=false]
            	 * Pass `true` to close all folders in this GUI by default.
            	 *
            	 * @param {boolean} [options.injectStyles=true]
            	 * Injects the default stylesheet into the page if this is the first GUI.
            	 * Pass `false` to use your own stylesheet.
            	 *
            	 * @param {number} [options.touchStyles=true]
            	 * Makes controllers larger on touch devices. Pass `false` to disable touch styles.
            	 *
            	 * @param {GUI} [options.parent]
            	 * Adds this GUI as a child in another GUI. Usually this is done for you by `addFolder()`.
            	 *
            	 */
            	constructor( {
            		parent,
            		autoPlace = parent === undefined,
            		container,
            		width,
            		title = 'Controls',
            		closeFolders = false,
            		injectStyles = true,
            		touchStyles = true
            	} = {} ) {

            		/**
            		 * The GUI containing this folder, or `undefined` if this is the root GUI.
            		 * @type {GUI}
            		 */
            		this.parent = parent;

            		/**
            		 * The top level GUI containing this folder, or `this` if this is the root GUI.
            		 * @type {GUI}
            		 */
            		this.root = parent ? parent.root : this;

            		/**
            		 * The list of controllers and folders contained by this GUI.
            		 * @type {Array<GUI|Controller>}
            		 */
            		this.children = [];

            		/**
            		 * The list of controllers contained by this GUI.
            		 * @type {Array<Controller>}
            		 */
            		this.controllers = [];

            		/**
            		 * The list of folders contained by this GUI.
            		 * @type {Array<GUI>}
            		 */
            		this.folders = [];

            		/**
            		 * Used to determine if the GUI is closed. Use `gui.open()` or `gui.close()` to change this.
            		 * @type {boolean}
            		 */
            		this._closed = false;

            		/**
            		 * Used to determine if the GUI is hidden. Use `gui.show()` or `gui.hide()` to change this.
            		 * @type {boolean}
            		 */
            		this._hidden = false;

            		/**
            		 * The outermost container element.
            		 * @type {HTMLElement}
            		 */
            		this.domElement = document.createElement( 'div' );
            		this.domElement.classList.add( 'lil-gui' );

            		/**
            		 * The DOM element that contains the title.
            		 * @type {HTMLElement}
            		 */
            		this.$title = document.createElement( 'div' );
            		this.$title.classList.add( 'title' );
            		this.$title.setAttribute( 'role', 'button' );
            		this.$title.setAttribute( 'aria-expanded', true );
            		this.$title.setAttribute( 'tabindex', 0 );

            		this.$title.addEventListener( 'click', () => this.openAnimated( this._closed ) );
            		this.$title.addEventListener( 'keydown', e => {
            			if ( e.code === 'Enter' || e.code === 'Space' ) {
            				e.preventDefault();
            				this.$title.click();
            			}
            		} );

            		// enables :active pseudo class on mobile
            		this.$title.addEventListener( 'touchstart', () => {}, { passive: true } );

            		/**
            		 * The DOM element that contains children.
            		 * @type {HTMLElement}
            		 */
            		this.$children = document.createElement( 'div' );
            		this.$children.classList.add( 'children' );

            		this.domElement.appendChild( this.$title );
            		this.domElement.appendChild( this.$children );

            		this.title( title );

            		if ( touchStyles ) {
            			this.domElement.classList.add( 'allow-touch-styles' );
            		}

            		if ( this.parent ) {

            			this.parent.children.push( this );
            			this.parent.folders.push( this );

            			this.parent.$children.appendChild( this.domElement );

            			// Stop the constructor early, everything onward only applies to root GUI's
            			return;

            		}

            		this.domElement.classList.add( 'root' );

            		// Inject stylesheet if we haven't done that yet
            		if ( !stylesInjected && injectStyles ) {
            			_injectStyles( stylesheet );
            			stylesInjected = true;
            		}

            		if ( container ) {

            			container.appendChild( this.domElement );

            		} else if ( autoPlace ) {

            			this.domElement.classList.add( 'autoPlace' );
            			document.body.appendChild( this.domElement );

            		}

            		if ( width ) {
            			this.domElement.style.setProperty( '--width', width + 'px' );
            		}

            		this._closeFolders = closeFolders;

            		// Don't fire global key events while typing in the GUI:
            		this.domElement.addEventListener( 'keydown', e => e.stopPropagation() );
            		this.domElement.addEventListener( 'keyup', e => e.stopPropagation() );

            	}

            	/**
            	 * Adds a controller to the GUI, inferring controller type using the `typeof` operator.
            	 * @example
            	 * gui.add( object, 'property' );
            	 * gui.add( object, 'number', 0, 100, 1 );
            	 * gui.add( object, 'options', [ 1, 2, 3 ] );
            	 *
            	 * @param {object} object The object the controller will modify.
            	 * @param {string} property Name of the property to control.
            	 * @param {number|object|Array} [$1] Minimum value for number controllers, or the set of
            	 * selectable values for a dropdown.
            	 * @param {number} [max] Maximum value for number controllers.
            	 * @param {number} [step] Step value for number controllers.
            	 * @returns {Controller}
            	 */
            	add( object, property, $1, max, step ) {

            		if ( Object( $1 ) === $1 ) {

            			return new OptionController( this, object, property, $1 );

            		}

            		const initialValue = object[ property ];

            		switch ( typeof initialValue ) {

            			case 'number':

            				return new NumberController( this, object, property, $1, max, step );

            			case 'boolean':

            				return new BooleanController( this, object, property );

            			case 'string':

            				return new StringController( this, object, property );

            			case 'function':

            				return new FunctionController( this, object, property );

            		}

            		console.error( `gui.add failed
	property:`, property, `
	object:`, object, `
	value:`, initialValue );

            	}

            	/**
            	 * Adds a color controller to the GUI.
            	 * @example
            	 * params = {
            	 * 	cssColor: '#ff00ff',
            	 * 	rgbColor: { r: 0, g: 0.2, b: 0.4 },
            	 * 	customRange: [ 0, 127, 255 ],
            	 * };
            	 *
            	 * gui.addColor( params, 'cssColor' );
            	 * gui.addColor( params, 'rgbColor' );
            	 * gui.addColor( params, 'customRange', 255 );
            	 *
            	 * @param {object} object The object the controller will modify.
            	 * @param {string} property Name of the property to control.
            	 * @param {number} rgbScale Maximum value for a color channel when using an RGB color. You may
            	 * need to set this to 255 if your colors are too bright.
            	 * @returns {Controller}
            	 */
            	addColor( object, property, rgbScale = 1 ) {
            		return new ColorController( this, object, property, rgbScale );
            	}

            	/**
            	 * Adds a folder to the GUI, which is just another GUI. This method returns
            	 * the nested GUI so you can add controllers to it.
            	 * @example
            	 * const folder = gui.addFolder( 'Position' );
            	 * folder.add( position, 'x' );
            	 * folder.add( position, 'y' );
            	 * folder.add( position, 'z' );
            	 *
            	 * @param {string} title Name to display in the folder's title bar.
            	 * @returns {GUI}
            	 */
            	addFolder( title ) {
            		const folder = new GUI( { parent: this, title } );
            		if ( this.root._closeFolders ) folder.close();
            		return folder;
            	}

            	/**
            	 * Recalls values that were saved with `gui.save()`.
            	 * @param {object} obj
            	 * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
            	 * @returns {this}
            	 */
            	load( obj, recursive = true ) {

            		if ( obj.controllers ) {

            			this.controllers.forEach( c => {

            				if ( c instanceof FunctionController ) return;

            				if ( c._name in obj.controllers ) {
            					c.load( obj.controllers[ c._name ] );
            				}

            			} );

            		}

            		if ( recursive && obj.folders ) {

            			this.folders.forEach( f => {

            				if ( f._title in obj.folders ) {
            					f.load( obj.folders[ f._title ] );
            				}

            			} );

            		}

            		return this;

            	}

            	/**
            	 * Returns an object mapping controller names to values. The object can be passed to `gui.load()` to
            	 * recall these values.
            	 * @example
            	 * {
            	 * 	controllers: {
            	 * 		prop1: 1,
            	 * 		prop2: 'value',
            	 * 		...
            	 * 	},
            	 * 	folders: {
            	 * 		folderName1: { controllers, folders },
            	 * 		folderName2: { controllers, folders }
            	 * 		...
            	 * 	}
            	 * }
            	 *
            	 * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
            	 * @returns {object}
            	 */
            	save( recursive = true ) {

            		const obj = {
            			controllers: {},
            			folders: {}
            		};

            		this.controllers.forEach( c => {

            			if ( c instanceof FunctionController ) return;

            			if ( c._name in obj.controllers ) {
            				throw new Error( `Cannot save GUI with duplicate property "${c._name}"` );
            			}

            			obj.controllers[ c._name ] = c.save();

            		} );

            		if ( recursive ) {

            			this.folders.forEach( f => {

            				if ( f._title in obj.folders ) {
            					throw new Error( `Cannot save GUI with duplicate folder "${f._title}"` );
            				}

            				obj.folders[ f._title ] = f.save();

            			} );

            		}

            		return obj;

            	}

            	/**
            	 * Opens a GUI or folder. GUI and folders are open by default.
            	 * @param {boolean} open Pass false to close
            	 * @returns {this}
            	 * @example
            	 * gui.open(); // open
            	 * gui.open( false ); // close
            	 * gui.open( gui._closed ); // toggle
            	 */
            	open( open = true ) {

            		this._setClosed( !open );

            		this.$title.setAttribute( 'aria-expanded', !this._closed );
            		this.domElement.classList.toggle( 'closed', this._closed );

            		return this;

            	}

            	/**
            	 * Closes the GUI.
            	 * @returns {this}
            	 */
            	close() {
            		return this.open( false );
            	}

            	_setClosed( closed ) {
            		if ( this._closed === closed ) return;
            		this._closed = closed;
            		this._callOnOpenClose( this );
            	}

            	/**
            	 * Shows the GUI after it's been hidden.
            	 * @param {boolean} show
            	 * @returns {this}
            	 * @example
            	 * gui.show();
            	 * gui.show( false ); // hide
            	 * gui.show( gui._hidden ); // toggle
            	 */
            	show( show = true ) {

            		this._hidden = !show;

            		this.domElement.style.display = this._hidden ? 'none' : '';

            		return this;

            	}

            	/**
            	 * Hides the GUI.
            	 * @returns {this}
            	 */
            	hide() {
            		return this.show( false );
            	}

            	openAnimated( open = true ) {

            		// set state immediately
            		this._setClosed( !open );

            		this.$title.setAttribute( 'aria-expanded', !this._closed );

            		// wait for next frame to measure $children
            		requestAnimationFrame( () => {

            			// explicitly set initial height for transition
            			const initialHeight = this.$children.clientHeight;
            			this.$children.style.height = initialHeight + 'px';

            			this.domElement.classList.add( 'transition' );

            			const onTransitionEnd = e => {
            				if ( e.target !== this.$children ) return;
            				this.$children.style.height = '';
            				this.domElement.classList.remove( 'transition' );
            				this.$children.removeEventListener( 'transitionend', onTransitionEnd );
            			};

            			this.$children.addEventListener( 'transitionend', onTransitionEnd );

            			// todo: this is wrong if children's scrollHeight makes for a gui taller than maxHeight
            			const targetHeight = !open ? 0 : this.$children.scrollHeight;

            			this.domElement.classList.toggle( 'closed', !open );

            			requestAnimationFrame( () => {
            				this.$children.style.height = targetHeight + 'px';
            			} );

            		} );

            		return this;

            	}

            	/**
            	 * Change the title of this GUI.
            	 * @param {string} title
            	 * @returns {this}
            	 */
            	title( title ) {
            		/**
            		 * Current title of the GUI. Use `gui.title( 'Title' )` to modify this value.
            		 * @type {string}
            		 */
            		this._title = title;
            		this.$title.innerHTML = title;
            		return this;
            	}

            	/**
            	 * Resets all controllers to their initial values.
            	 * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
            	 * @returns {this}
            	 */
            	reset( recursive = true ) {
            		const controllers = recursive ? this.controllersRecursive() : this.controllers;
            		controllers.forEach( c => c.reset() );
            		return this;
            	}

            	/**
            	 * Pass a function to be called whenever a controller in this GUI changes.
            	 * @param {function({object:object, property:string, value:any, controller:Controller})} callback
            	 * @returns {this}
            	 * @example
            	 * gui.onChange( event => {
            	 * 	event.object     // object that was modified
            	 * 	event.property   // string, name of property
            	 * 	event.value      // new value of controller
            	 * 	event.controller // controller that was modified
            	 * } );
            	 */
            	onChange( callback ) {
            		/**
            		 * Used to access the function bound to `onChange` events. Don't modify this value
            		 * directly. Use the `gui.onChange( callback )` method instead.
            		 * @type {Function}
            		 */
            		this._onChange = callback;
            		return this;
            	}

            	_callOnChange( controller ) {

            		if ( this.parent ) {
            			this.parent._callOnChange( controller );
            		}

            		if ( this._onChange !== undefined ) {
            			this._onChange.call( this, {
            				object: controller.object,
            				property: controller.property,
            				value: controller.getValue(),
            				controller
            			} );
            		}
            	}

            	/**
            	 * Pass a function to be called whenever a controller in this GUI has finished changing.
            	 * @param {function({object:object, property:string, value:any, controller:Controller})} callback
            	 * @returns {this}
            	 * @example
            	 * gui.onFinishChange( event => {
            	 * 	event.object     // object that was modified
            	 * 	event.property   // string, name of property
            	 * 	event.value      // new value of controller
            	 * 	event.controller // controller that was modified
            	 * } );
            	 */
            	onFinishChange( callback ) {
            		/**
            		 * Used to access the function bound to `onFinishChange` events. Don't modify this value
            		 * directly. Use the `gui.onFinishChange( callback )` method instead.
            		 * @type {Function}
            		 */
            		this._onFinishChange = callback;
            		return this;
            	}

            	_callOnFinishChange( controller ) {

            		if ( this.parent ) {
            			this.parent._callOnFinishChange( controller );
            		}

            		if ( this._onFinishChange !== undefined ) {
            			this._onFinishChange.call( this, {
            				object: controller.object,
            				property: controller.property,
            				value: controller.getValue(),
            				controller
            			} );
            		}
            	}

            	/**
            	 * Pass a function to be called when this GUI or its descendants are opened or closed.
            	 * @param {function(GUI)} callback
            	 * @returns {this}
            	 * @example
            	 * gui.onOpenClose( changedGUI => {
            	 * 	console.log( changedGUI._closed );
            	 * } );
            	 */
            	onOpenClose( callback ) {
            		this._onOpenClose = callback;
            		return this;
            	}

            	_callOnOpenClose( changedGUI ) {
            		if ( this.parent ) {
            			this.parent._callOnOpenClose( changedGUI );
            		}

            		if ( this._onOpenClose !== undefined ) {
            			this._onOpenClose.call( this, changedGUI );
            		}
            	}

            	/**
            	 * Destroys all DOM elements and event listeners associated with this GUI
            	 */
            	destroy() {

            		if ( this.parent ) {
            			this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
            			this.parent.folders.splice( this.parent.folders.indexOf( this ), 1 );
            		}

            		if ( this.domElement.parentElement ) {
            			this.domElement.parentElement.removeChild( this.domElement );
            		}

            		Array.from( this.children ).forEach( c => c.destroy() );

            	}

            	/**
            	 * Returns an array of controllers contained by this GUI and its descendents.
            	 * @returns {Controller[]}
            	 */
            	controllersRecursive() {
            		let controllers = Array.from( this.controllers );
            		this.folders.forEach( f => {
            			controllers = controllers.concat( f.controllersRecursive() );
            		} );
            		return controllers;
            	}

            	/**
            	 * Returns an array of folders contained by this GUI and its descendents.
            	 * @returns {GUI[]}
            	 */
            	foldersRecursive() {
            		let folders = Array.from( this.folders );
            		this.folders.forEach( f => {
            			folders = folders.concat( f.foldersRecursive() );
            		} );
            		return folders;
            	}

            }

            class IterLoader {
                constructor(options) {
                    this.reset(options);
                    this.setIter(options);
                    this[Symbol.iterator] = this.iterItems;
                }
                reset(options) {
                    this.options = options;
                    this.items = [];
                    this.step = options.step || 1;
                    this.done = false;
                }
                setIter(options) {
                    this.iter = options.iter;
                }
                *iterItems() {
                    let i = 0;
                    let item = this.item(i++);
                    while(item) {
                        yield item;
                        item = this.item(i++);
                    }
                }
                item(index) {
                    if(!this.done && index >= this.items.length)
                        this.load(index);
                    return this.items[index] || null;
                }
                load(index) {
                    let count = Math.max(index + 1 - this.items.length, this.step);
                    while (count > 0) {
                        let {value, done} = this.iter.next();
                        if(!done) {
                            let v = this.pack(value);
                            if(v) {
                                this.items.push(v);
                                count--;
                            }
                        } else {
                            this.done = true;
                            break;
                        }
                    }
                }
                pack(value) {
                    return value;
                }
            }

            class Line$1 {
                constructor() {
                    this.words = [];
                    this._contentHeight = 0;

                }
                addWord(word) {
                    this.words.push(word);
                }
                //get width() {
                //}
                get contentHeight() {
                    return this._contentHeight;
                }
                set contentHeight(h) {
                    return this._contentHeight = h;
                }

                get wordsHeight() {
                    if(this._wordsHeight) return this._wordsHeight;
                    let h = 0;
                    for(let word of this.words) {
                        h = Math.max(h, word.height);
                    }
                    this._wordsHeight = h;
                    return this._wordsHeight;
                }
                get descent() {
                    if(this._descent) return this._descent;
                    let h = 0;
                    for(let word of this.words) {
                        h = Math.max(h, word.descent);
                    }
                    this._descent = h;
                    return this._descent;
                }
                get text() {
                    let a = [];
                    for(let word of this.words) {
                        a.push(word.text);
                    }
                    return a.join('');
                }
                get notEmpty() {
                    return this.words.length > 0;
                }
            }

            var lookup = [];
            var revLookup = [];
            var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
            var inited = false;
            function init () {
              inited = true;
              var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
              for (var i = 0, len = code.length; i < len; ++i) {
                lookup[i] = code[i];
                revLookup[code.charCodeAt(i)] = i;
              }

              revLookup['-'.charCodeAt(0)] = 62;
              revLookup['_'.charCodeAt(0)] = 63;
            }

            function toByteArray (b64) {
              if (!inited) {
                init();
              }
              var i, j, l, tmp, placeHolders, arr;
              var len = b64.length;

              if (len % 4 > 0) {
                throw new Error('Invalid string. Length must be a multiple of 4')
              }

              // the number of equal signs (place holders)
              // if there are two placeholders, than the two characters before it
              // represent one byte
              // if there is only one, then the three characters before it represent 2 bytes
              // this is just a cheap hack to not do indexOf twice
              placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

              // base64 is 4/3 + up to two characters of the original data
              arr = new Arr(len * 3 / 4 - placeHolders);

              // if there are placeholders, only get up to the last complete 4 chars
              l = placeHolders > 0 ? len - 4 : len;

              var L = 0;

              for (i = 0, j = 0; i < l; i += 4, j += 3) {
                tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
                arr[L++] = (tmp >> 16) & 0xFF;
                arr[L++] = (tmp >> 8) & 0xFF;
                arr[L++] = tmp & 0xFF;
              }

              if (placeHolders === 2) {
                tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
                arr[L++] = tmp & 0xFF;
              } else if (placeHolders === 1) {
                tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
                arr[L++] = (tmp >> 8) & 0xFF;
                arr[L++] = tmp & 0xFF;
              }

              return arr
            }

            function tripletToBase64 (num) {
              return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
            }

            function encodeChunk (uint8, start, end) {
              var tmp;
              var output = [];
              for (var i = start; i < end; i += 3) {
                tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
                output.push(tripletToBase64(tmp));
              }
              return output.join('')
            }

            function fromByteArray (uint8) {
              if (!inited) {
                init();
              }
              var tmp;
              var len = uint8.length;
              var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
              var output = '';
              var parts = [];
              var maxChunkLength = 16383; // must be multiple of 3

              // go through the array every three bytes, we'll deal with trailing stuff later
              for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
                parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
              }

              // pad the end with zeros, but make sure to not forget the extra bytes
              if (extraBytes === 1) {
                tmp = uint8[len - 1];
                output += lookup[tmp >> 2];
                output += lookup[(tmp << 4) & 0x3F];
                output += '==';
              } else if (extraBytes === 2) {
                tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
                output += lookup[tmp >> 10];
                output += lookup[(tmp >> 4) & 0x3F];
                output += lookup[(tmp << 2) & 0x3F];
                output += '=';
              }

              parts.push(output);

              return parts.join('')
            }

            function read (buffer, offset, isLE, mLen, nBytes) {
              var e, m;
              var eLen = nBytes * 8 - mLen - 1;
              var eMax = (1 << eLen) - 1;
              var eBias = eMax >> 1;
              var nBits = -7;
              var i = isLE ? (nBytes - 1) : 0;
              var d = isLE ? -1 : 1;
              var s = buffer[offset + i];

              i += d;

              e = s & ((1 << (-nBits)) - 1);
              s >>= (-nBits);
              nBits += eLen;
              for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

              m = e & ((1 << (-nBits)) - 1);
              e >>= (-nBits);
              nBits += mLen;
              for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

              if (e === 0) {
                e = 1 - eBias;
              } else if (e === eMax) {
                return m ? NaN : ((s ? -1 : 1) * Infinity)
              } else {
                m = m + Math.pow(2, mLen);
                e = e - eBias;
              }
              return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
            }

            function write (buffer, value, offset, isLE, mLen, nBytes) {
              var e, m, c;
              var eLen = nBytes * 8 - mLen - 1;
              var eMax = (1 << eLen) - 1;
              var eBias = eMax >> 1;
              var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
              var i = isLE ? 0 : (nBytes - 1);
              var d = isLE ? 1 : -1;
              var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

              value = Math.abs(value);

              if (isNaN(value) || value === Infinity) {
                m = isNaN(value) ? 1 : 0;
                e = eMax;
              } else {
                e = Math.floor(Math.log(value) / Math.LN2);
                if (value * (c = Math.pow(2, -e)) < 1) {
                  e--;
                  c *= 2;
                }
                if (e + eBias >= 1) {
                  value += rt / c;
                } else {
                  value += rt * Math.pow(2, 1 - eBias);
                }
                if (value * c >= 2) {
                  e++;
                  c /= 2;
                }

                if (e + eBias >= eMax) {
                  m = 0;
                  e = eMax;
                } else if (e + eBias >= 1) {
                  m = (value * c - 1) * Math.pow(2, mLen);
                  e = e + eBias;
                } else {
                  m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                  e = 0;
                }
              }

              for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

              e = (e << mLen) | m;
              eLen += mLen;
              for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

              buffer[offset + i - d] |= s * 128;
            }

            var toString = {}.toString;

            var isArray = Array.isArray || function (arr) {
              return toString.call(arr) == '[object Array]';
            };

            var INSPECT_MAX_BYTES = 50;

            /**
             * If `Buffer.TYPED_ARRAY_SUPPORT`:
             *   === true    Use Uint8Array implementation (fastest)
             *   === false   Use Object implementation (most compatible, even IE6)
             *
             * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
             * Opera 11.6+, iOS 4.2+.
             *
             * Due to various browser bugs, sometimes the Object implementation will be used even
             * when the browser supports typed arrays.
             *
             * Note:
             *
             *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
             *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
             *
             *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
             *
             *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
             *     incorrect length in some situations.

             * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
             * get the Object implementation, which is slower but behaves correctly.
             */
            Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
              ? global$1.TYPED_ARRAY_SUPPORT
              : true;

            /*
             * Export kMaxLength after typed array support is determined.
             */
            kMaxLength();

            function kMaxLength () {
              return Buffer.TYPED_ARRAY_SUPPORT
                ? 0x7fffffff
                : 0x3fffffff
            }

            function createBuffer (that, length) {
              if (kMaxLength() < length) {
                throw new RangeError('Invalid typed array length')
              }
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                // Return an augmented `Uint8Array` instance, for best performance
                that = new Uint8Array(length);
                that.__proto__ = Buffer.prototype;
              } else {
                // Fallback: Return an object instance of the Buffer class
                if (that === null) {
                  that = new Buffer(length);
                }
                that.length = length;
              }

              return that
            }

            /**
             * The Buffer constructor returns instances of `Uint8Array` that have their
             * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
             * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
             * and the `Uint8Array` methods. Square bracket notation works as expected -- it
             * returns a single octet.
             *
             * The `Uint8Array` prototype remains unmodified.
             */

            function Buffer (arg, encodingOrOffset, length) {
              if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
                return new Buffer(arg, encodingOrOffset, length)
              }

              // Common case.
              if (typeof arg === 'number') {
                if (typeof encodingOrOffset === 'string') {
                  throw new Error(
                    'If encoding is specified then the first argument must be a string'
                  )
                }
                return allocUnsafe(this, arg)
              }
              return from(this, arg, encodingOrOffset, length)
            }

            Buffer.poolSize = 8192; // not used by this implementation

            // TODO: Legacy, not needed anymore. Remove in next major version.
            Buffer._augment = function (arr) {
              arr.__proto__ = Buffer.prototype;
              return arr
            };

            function from (that, value, encodingOrOffset, length) {
              if (typeof value === 'number') {
                throw new TypeError('"value" argument must not be a number')
              }

              if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
                return fromArrayBuffer(that, value, encodingOrOffset, length)
              }

              if (typeof value === 'string') {
                return fromString(that, value, encodingOrOffset)
              }

              return fromObject(that, value)
            }

            /**
             * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
             * if value is a number.
             * Buffer.from(str[, encoding])
             * Buffer.from(array)
             * Buffer.from(buffer)
             * Buffer.from(arrayBuffer[, byteOffset[, length]])
             **/
            Buffer.from = function (value, encodingOrOffset, length) {
              return from(null, value, encodingOrOffset, length)
            };

            if (Buffer.TYPED_ARRAY_SUPPORT) {
              Buffer.prototype.__proto__ = Uint8Array.prototype;
              Buffer.__proto__ = Uint8Array;
              if (typeof Symbol !== 'undefined' && Symbol.species &&
                  Buffer[Symbol.species] === Buffer) ;
            }

            function assertSize (size) {
              if (typeof size !== 'number') {
                throw new TypeError('"size" argument must be a number')
              } else if (size < 0) {
                throw new RangeError('"size" argument must not be negative')
              }
            }

            function alloc (that, size, fill, encoding) {
              assertSize(size);
              if (size <= 0) {
                return createBuffer(that, size)
              }
              if (fill !== undefined) {
                // Only pay attention to encoding if it's a string. This
                // prevents accidentally sending in a number that would
                // be interpretted as a start offset.
                return typeof encoding === 'string'
                  ? createBuffer(that, size).fill(fill, encoding)
                  : createBuffer(that, size).fill(fill)
              }
              return createBuffer(that, size)
            }

            /**
             * Creates a new filled Buffer instance.
             * alloc(size[, fill[, encoding]])
             **/
            Buffer.alloc = function (size, fill, encoding) {
              return alloc(null, size, fill, encoding)
            };

            function allocUnsafe (that, size) {
              assertSize(size);
              that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
              if (!Buffer.TYPED_ARRAY_SUPPORT) {
                for (var i = 0; i < size; ++i) {
                  that[i] = 0;
                }
              }
              return that
            }

            /**
             * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
             * */
            Buffer.allocUnsafe = function (size) {
              return allocUnsafe(null, size)
            };
            /**
             * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
             */
            Buffer.allocUnsafeSlow = function (size) {
              return allocUnsafe(null, size)
            };

            function fromString (that, string, encoding) {
              if (typeof encoding !== 'string' || encoding === '') {
                encoding = 'utf8';
              }

              if (!Buffer.isEncoding(encoding)) {
                throw new TypeError('"encoding" must be a valid string encoding')
              }

              var length = byteLength(string, encoding) | 0;
              that = createBuffer(that, length);

              var actual = that.write(string, encoding);

              if (actual !== length) {
                // Writing a hex string, for example, that contains invalid characters will
                // cause everything after the first invalid character to be ignored. (e.g.
                // 'abxxcd' will be treated as 'ab')
                that = that.slice(0, actual);
              }

              return that
            }

            function fromArrayLike (that, array) {
              var length = array.length < 0 ? 0 : checked(array.length) | 0;
              that = createBuffer(that, length);
              for (var i = 0; i < length; i += 1) {
                that[i] = array[i] & 255;
              }
              return that
            }

            function fromArrayBuffer (that, array, byteOffset, length) {
              array.byteLength; // this throws if `array` is not a valid ArrayBuffer

              if (byteOffset < 0 || array.byteLength < byteOffset) {
                throw new RangeError('\'offset\' is out of bounds')
              }

              if (array.byteLength < byteOffset + (length || 0)) {
                throw new RangeError('\'length\' is out of bounds')
              }

              if (byteOffset === undefined && length === undefined) {
                array = new Uint8Array(array);
              } else if (length === undefined) {
                array = new Uint8Array(array, byteOffset);
              } else {
                array = new Uint8Array(array, byteOffset, length);
              }

              if (Buffer.TYPED_ARRAY_SUPPORT) {
                // Return an augmented `Uint8Array` instance, for best performance
                that = array;
                that.__proto__ = Buffer.prototype;
              } else {
                // Fallback: Return an object instance of the Buffer class
                that = fromArrayLike(that, array);
              }
              return that
            }

            function fromObject (that, obj) {
              if (internalIsBuffer(obj)) {
                var len = checked(obj.length) | 0;
                that = createBuffer(that, len);

                if (that.length === 0) {
                  return that
                }

                obj.copy(that, 0, 0, len);
                return that
              }

              if (obj) {
                if ((typeof ArrayBuffer !== 'undefined' &&
                    obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
                  if (typeof obj.length !== 'number' || isnan(obj.length)) {
                    return createBuffer(that, 0)
                  }
                  return fromArrayLike(that, obj)
                }

                if (obj.type === 'Buffer' && isArray(obj.data)) {
                  return fromArrayLike(that, obj.data)
                }
              }

              throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
            }

            function checked (length) {
              // Note: cannot use `length < kMaxLength()` here because that fails when
              // length is NaN (which is otherwise coerced to zero.)
              if (length >= kMaxLength()) {
                throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                                     'size: 0x' + kMaxLength().toString(16) + ' bytes')
              }
              return length | 0
            }
            Buffer.isBuffer = isBuffer;
            function internalIsBuffer (b) {
              return !!(b != null && b._isBuffer)
            }

            Buffer.compare = function compare (a, b) {
              if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
                throw new TypeError('Arguments must be Buffers')
              }

              if (a === b) return 0

              var x = a.length;
              var y = b.length;

              for (var i = 0, len = Math.min(x, y); i < len; ++i) {
                if (a[i] !== b[i]) {
                  x = a[i];
                  y = b[i];
                  break
                }
              }

              if (x < y) return -1
              if (y < x) return 1
              return 0
            };

            Buffer.isEncoding = function isEncoding (encoding) {
              switch (String(encoding).toLowerCase()) {
                case 'hex':
                case 'utf8':
                case 'utf-8':
                case 'ascii':
                case 'latin1':
                case 'binary':
                case 'base64':
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return true
                default:
                  return false
              }
            };

            Buffer.concat = function concat (list, length) {
              if (!isArray(list)) {
                throw new TypeError('"list" argument must be an Array of Buffers')
              }

              if (list.length === 0) {
                return Buffer.alloc(0)
              }

              var i;
              if (length === undefined) {
                length = 0;
                for (i = 0; i < list.length; ++i) {
                  length += list[i].length;
                }
              }

              var buffer = Buffer.allocUnsafe(length);
              var pos = 0;
              for (i = 0; i < list.length; ++i) {
                var buf = list[i];
                if (!internalIsBuffer(buf)) {
                  throw new TypeError('"list" argument must be an Array of Buffers')
                }
                buf.copy(buffer, pos);
                pos += buf.length;
              }
              return buffer
            };

            function byteLength (string, encoding) {
              if (internalIsBuffer(string)) {
                return string.length
              }
              if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
                  (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
                return string.byteLength
              }
              if (typeof string !== 'string') {
                string = '' + string;
              }

              var len = string.length;
              if (len === 0) return 0

              // Use a for loop to avoid recursion
              var loweredCase = false;
              for (;;) {
                switch (encoding) {
                  case 'ascii':
                  case 'latin1':
                  case 'binary':
                    return len
                  case 'utf8':
                  case 'utf-8':
                  case undefined:
                    return utf8ToBytes(string).length
                  case 'ucs2':
                  case 'ucs-2':
                  case 'utf16le':
                  case 'utf-16le':
                    return len * 2
                  case 'hex':
                    return len >>> 1
                  case 'base64':
                    return base64ToBytes(string).length
                  default:
                    if (loweredCase) return utf8ToBytes(string).length // assume utf8
                    encoding = ('' + encoding).toLowerCase();
                    loweredCase = true;
                }
              }
            }
            Buffer.byteLength = byteLength;

            function slowToString (encoding, start, end) {
              var loweredCase = false;

              // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
              // property of a typed array.

              // This behaves neither like String nor Uint8Array in that we set start/end
              // to their upper/lower bounds if the value passed is out of range.
              // undefined is handled specially as per ECMA-262 6th Edition,
              // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
              if (start === undefined || start < 0) {
                start = 0;
              }
              // Return early if start > this.length. Done here to prevent potential uint32
              // coercion fail below.
              if (start > this.length) {
                return ''
              }

              if (end === undefined || end > this.length) {
                end = this.length;
              }

              if (end <= 0) {
                return ''
              }

              // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
              end >>>= 0;
              start >>>= 0;

              if (end <= start) {
                return ''
              }

              if (!encoding) encoding = 'utf8';

              while (true) {
                switch (encoding) {
                  case 'hex':
                    return hexSlice(this, start, end)

                  case 'utf8':
                  case 'utf-8':
                    return utf8Slice(this, start, end)

                  case 'ascii':
                    return asciiSlice(this, start, end)

                  case 'latin1':
                  case 'binary':
                    return latin1Slice(this, start, end)

                  case 'base64':
                    return base64Slice(this, start, end)

                  case 'ucs2':
                  case 'ucs-2':
                  case 'utf16le':
                  case 'utf-16le':
                    return utf16leSlice(this, start, end)

                  default:
                    if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                    encoding = (encoding + '').toLowerCase();
                    loweredCase = true;
                }
              }
            }

            // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
            // Buffer instances.
            Buffer.prototype._isBuffer = true;

            function swap$1 (b, n, m) {
              var i = b[n];
              b[n] = b[m];
              b[m] = i;
            }

            Buffer.prototype.swap16 = function swap16 () {
              var len = this.length;
              if (len % 2 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 16-bits')
              }
              for (var i = 0; i < len; i += 2) {
                swap$1(this, i, i + 1);
              }
              return this
            };

            Buffer.prototype.swap32 = function swap32 () {
              var len = this.length;
              if (len % 4 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 32-bits')
              }
              for (var i = 0; i < len; i += 4) {
                swap$1(this, i, i + 3);
                swap$1(this, i + 1, i + 2);
              }
              return this
            };

            Buffer.prototype.swap64 = function swap64 () {
              var len = this.length;
              if (len % 8 !== 0) {
                throw new RangeError('Buffer size must be a multiple of 64-bits')
              }
              for (var i = 0; i < len; i += 8) {
                swap$1(this, i, i + 7);
                swap$1(this, i + 1, i + 6);
                swap$1(this, i + 2, i + 5);
                swap$1(this, i + 3, i + 4);
              }
              return this
            };

            Buffer.prototype.toString = function toString () {
              var length = this.length | 0;
              if (length === 0) return ''
              if (arguments.length === 0) return utf8Slice(this, 0, length)
              return slowToString.apply(this, arguments)
            };

            Buffer.prototype.equals = function equals (b) {
              if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
              if (this === b) return true
              return Buffer.compare(this, b) === 0
            };

            Buffer.prototype.inspect = function inspect () {
              var str = '';
              var max = INSPECT_MAX_BYTES;
              if (this.length > 0) {
                str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
                if (this.length > max) str += ' ... ';
              }
              return '<Buffer ' + str + '>'
            };

            Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
              if (!internalIsBuffer(target)) {
                throw new TypeError('Argument must be a Buffer')
              }

              if (start === undefined) {
                start = 0;
              }
              if (end === undefined) {
                end = target ? target.length : 0;
              }
              if (thisStart === undefined) {
                thisStart = 0;
              }
              if (thisEnd === undefined) {
                thisEnd = this.length;
              }

              if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
                throw new RangeError('out of range index')
              }

              if (thisStart >= thisEnd && start >= end) {
                return 0
              }
              if (thisStart >= thisEnd) {
                return -1
              }
              if (start >= end) {
                return 1
              }

              start >>>= 0;
              end >>>= 0;
              thisStart >>>= 0;
              thisEnd >>>= 0;

              if (this === target) return 0

              var x = thisEnd - thisStart;
              var y = end - start;
              var len = Math.min(x, y);

              var thisCopy = this.slice(thisStart, thisEnd);
              var targetCopy = target.slice(start, end);

              for (var i = 0; i < len; ++i) {
                if (thisCopy[i] !== targetCopy[i]) {
                  x = thisCopy[i];
                  y = targetCopy[i];
                  break
                }
              }

              if (x < y) return -1
              if (y < x) return 1
              return 0
            };

            // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
            // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
            //
            // Arguments:
            // - buffer - a Buffer to search
            // - val - a string, Buffer, or number
            // - byteOffset - an index into `buffer`; will be clamped to an int32
            // - encoding - an optional encoding, relevant is val is a string
            // - dir - true for indexOf, false for lastIndexOf
            function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
              // Empty buffer means no match
              if (buffer.length === 0) return -1

              // Normalize byteOffset
              if (typeof byteOffset === 'string') {
                encoding = byteOffset;
                byteOffset = 0;
              } else if (byteOffset > 0x7fffffff) {
                byteOffset = 0x7fffffff;
              } else if (byteOffset < -0x80000000) {
                byteOffset = -0x80000000;
              }
              byteOffset = +byteOffset;  // Coerce to Number.
              if (isNaN(byteOffset)) {
                // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
                byteOffset = dir ? 0 : (buffer.length - 1);
              }

              // Normalize byteOffset: negative offsets start from the end of the buffer
              if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
              if (byteOffset >= buffer.length) {
                if (dir) return -1
                else byteOffset = buffer.length - 1;
              } else if (byteOffset < 0) {
                if (dir) byteOffset = 0;
                else return -1
              }

              // Normalize val
              if (typeof val === 'string') {
                val = Buffer.from(val, encoding);
              }

              // Finally, search either indexOf (if dir is true) or lastIndexOf
              if (internalIsBuffer(val)) {
                // Special case: looking for empty string/buffer always fails
                if (val.length === 0) {
                  return -1
                }
                return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
              } else if (typeof val === 'number') {
                val = val & 0xFF; // Search for a byte value [0-255]
                if (Buffer.TYPED_ARRAY_SUPPORT &&
                    typeof Uint8Array.prototype.indexOf === 'function') {
                  if (dir) {
                    return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
                  } else {
                    return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
                  }
                }
                return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
              }

              throw new TypeError('val must be string, number or Buffer')
            }

            function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
              var indexSize = 1;
              var arrLength = arr.length;
              var valLength = val.length;

              if (encoding !== undefined) {
                encoding = String(encoding).toLowerCase();
                if (encoding === 'ucs2' || encoding === 'ucs-2' ||
                    encoding === 'utf16le' || encoding === 'utf-16le') {
                  if (arr.length < 2 || val.length < 2) {
                    return -1
                  }
                  indexSize = 2;
                  arrLength /= 2;
                  valLength /= 2;
                  byteOffset /= 2;
                }
              }

              function read (buf, i) {
                if (indexSize === 1) {
                  return buf[i]
                } else {
                  return buf.readUInt16BE(i * indexSize)
                }
              }

              var i;
              if (dir) {
                var foundIndex = -1;
                for (i = byteOffset; i < arrLength; i++) {
                  if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                    if (foundIndex === -1) foundIndex = i;
                    if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
                  } else {
                    if (foundIndex !== -1) i -= i - foundIndex;
                    foundIndex = -1;
                  }
                }
              } else {
                if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
                for (i = byteOffset; i >= 0; i--) {
                  var found = true;
                  for (var j = 0; j < valLength; j++) {
                    if (read(arr, i + j) !== read(val, j)) {
                      found = false;
                      break
                    }
                  }
                  if (found) return i
                }
              }

              return -1
            }

            Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
              return this.indexOf(val, byteOffset, encoding) !== -1
            };

            Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
              return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
            };

            Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
              return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
            };

            function hexWrite (buf, string, offset, length) {
              offset = Number(offset) || 0;
              var remaining = buf.length - offset;
              if (!length) {
                length = remaining;
              } else {
                length = Number(length);
                if (length > remaining) {
                  length = remaining;
                }
              }

              // must be an even number of digits
              var strLen = string.length;
              if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

              if (length > strLen / 2) {
                length = strLen / 2;
              }
              for (var i = 0; i < length; ++i) {
                var parsed = parseInt(string.substr(i * 2, 2), 16);
                if (isNaN(parsed)) return i
                buf[offset + i] = parsed;
              }
              return i
            }

            function utf8Write (buf, string, offset, length) {
              return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
            }

            function asciiWrite (buf, string, offset, length) {
              return blitBuffer(asciiToBytes(string), buf, offset, length)
            }

            function latin1Write (buf, string, offset, length) {
              return asciiWrite(buf, string, offset, length)
            }

            function base64Write (buf, string, offset, length) {
              return blitBuffer(base64ToBytes(string), buf, offset, length)
            }

            function ucs2Write (buf, string, offset, length) {
              return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
            }

            Buffer.prototype.write = function write (string, offset, length, encoding) {
              // Buffer#write(string)
              if (offset === undefined) {
                encoding = 'utf8';
                length = this.length;
                offset = 0;
              // Buffer#write(string, encoding)
              } else if (length === undefined && typeof offset === 'string') {
                encoding = offset;
                length = this.length;
                offset = 0;
              // Buffer#write(string, offset[, length][, encoding])
              } else if (isFinite(offset)) {
                offset = offset | 0;
                if (isFinite(length)) {
                  length = length | 0;
                  if (encoding === undefined) encoding = 'utf8';
                } else {
                  encoding = length;
                  length = undefined;
                }
              // legacy write(string, encoding, offset, length) - remove in v0.13
              } else {
                throw new Error(
                  'Buffer.write(string, encoding, offset[, length]) is no longer supported'
                )
              }

              var remaining = this.length - offset;
              if (length === undefined || length > remaining) length = remaining;

              if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
                throw new RangeError('Attempt to write outside buffer bounds')
              }

              if (!encoding) encoding = 'utf8';

              var loweredCase = false;
              for (;;) {
                switch (encoding) {
                  case 'hex':
                    return hexWrite(this, string, offset, length)

                  case 'utf8':
                  case 'utf-8':
                    return utf8Write(this, string, offset, length)

                  case 'ascii':
                    return asciiWrite(this, string, offset, length)

                  case 'latin1':
                  case 'binary':
                    return latin1Write(this, string, offset, length)

                  case 'base64':
                    // Warning: maxLength not taken into account in base64Write
                    return base64Write(this, string, offset, length)

                  case 'ucs2':
                  case 'ucs-2':
                  case 'utf16le':
                  case 'utf-16le':
                    return ucs2Write(this, string, offset, length)

                  default:
                    if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
                    encoding = ('' + encoding).toLowerCase();
                    loweredCase = true;
                }
              }
            };

            Buffer.prototype.toJSON = function toJSON () {
              return {
                type: 'Buffer',
                data: Array.prototype.slice.call(this._arr || this, 0)
              }
            };

            function base64Slice (buf, start, end) {
              if (start === 0 && end === buf.length) {
                return fromByteArray(buf)
              } else {
                return fromByteArray(buf.slice(start, end))
              }
            }

            function utf8Slice (buf, start, end) {
              end = Math.min(buf.length, end);
              var res = [];

              var i = start;
              while (i < end) {
                var firstByte = buf[i];
                var codePoint = null;
                var bytesPerSequence = (firstByte > 0xEF) ? 4
                  : (firstByte > 0xDF) ? 3
                  : (firstByte > 0xBF) ? 2
                  : 1;

                if (i + bytesPerSequence <= end) {
                  var secondByte, thirdByte, fourthByte, tempCodePoint;

                  switch (bytesPerSequence) {
                    case 1:
                      if (firstByte < 0x80) {
                        codePoint = firstByte;
                      }
                      break
                    case 2:
                      secondByte = buf[i + 1];
                      if ((secondByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                        if (tempCodePoint > 0x7F) {
                          codePoint = tempCodePoint;
                        }
                      }
                      break
                    case 3:
                      secondByte = buf[i + 1];
                      thirdByte = buf[i + 2];
                      if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                        if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                          codePoint = tempCodePoint;
                        }
                      }
                      break
                    case 4:
                      secondByte = buf[i + 1];
                      thirdByte = buf[i + 2];
                      fourthByte = buf[i + 3];
                      if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                        if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                          codePoint = tempCodePoint;
                        }
                      }
                  }
                }

                if (codePoint === null) {
                  // we did not generate a valid codePoint so insert a
                  // replacement char (U+FFFD) and advance only 1 byte
                  codePoint = 0xFFFD;
                  bytesPerSequence = 1;
                } else if (codePoint > 0xFFFF) {
                  // encode to utf16 (surrogate pair dance)
                  codePoint -= 0x10000;
                  res.push(codePoint >>> 10 & 0x3FF | 0xD800);
                  codePoint = 0xDC00 | codePoint & 0x3FF;
                }

                res.push(codePoint);
                i += bytesPerSequence;
              }

              return decodeCodePointsArray(res)
            }

            // Based on http://stackoverflow.com/a/22747272/680742, the browser with
            // the lowest limit is Chrome, with 0x10000 args.
            // We go 1 magnitude less, for safety
            var MAX_ARGUMENTS_LENGTH = 0x1000;

            function decodeCodePointsArray (codePoints) {
              var len = codePoints.length;
              if (len <= MAX_ARGUMENTS_LENGTH) {
                return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
              }

              // Decode in chunks to avoid "call stack size exceeded".
              var res = '';
              var i = 0;
              while (i < len) {
                res += String.fromCharCode.apply(
                  String,
                  codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
                );
              }
              return res
            }

            function asciiSlice (buf, start, end) {
              var ret = '';
              end = Math.min(buf.length, end);

              for (var i = start; i < end; ++i) {
                ret += String.fromCharCode(buf[i] & 0x7F);
              }
              return ret
            }

            function latin1Slice (buf, start, end) {
              var ret = '';
              end = Math.min(buf.length, end);

              for (var i = start; i < end; ++i) {
                ret += String.fromCharCode(buf[i]);
              }
              return ret
            }

            function hexSlice (buf, start, end) {
              var len = buf.length;

              if (!start || start < 0) start = 0;
              if (!end || end < 0 || end > len) end = len;

              var out = '';
              for (var i = start; i < end; ++i) {
                out += toHex(buf[i]);
              }
              return out
            }

            function utf16leSlice (buf, start, end) {
              var bytes = buf.slice(start, end);
              var res = '';
              for (var i = 0; i < bytes.length; i += 2) {
                res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
              }
              return res
            }

            Buffer.prototype.slice = function slice (start, end) {
              var len = this.length;
              start = ~~start;
              end = end === undefined ? len : ~~end;

              if (start < 0) {
                start += len;
                if (start < 0) start = 0;
              } else if (start > len) {
                start = len;
              }

              if (end < 0) {
                end += len;
                if (end < 0) end = 0;
              } else if (end > len) {
                end = len;
              }

              if (end < start) end = start;

              var newBuf;
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                newBuf = this.subarray(start, end);
                newBuf.__proto__ = Buffer.prototype;
              } else {
                var sliceLen = end - start;
                newBuf = new Buffer(sliceLen, undefined);
                for (var i = 0; i < sliceLen; ++i) {
                  newBuf[i] = this[i + start];
                }
              }

              return newBuf
            };

            /*
             * Need to make sure that buffer isn't trying to write out of bounds.
             */
            function checkOffset (offset, ext, length) {
              if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
              if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
            }

            Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) checkOffset(offset, byteLength, this.length);

              var val = this[offset];
              var mul = 1;
              var i = 0;
              while (++i < byteLength && (mul *= 0x100)) {
                val += this[offset + i] * mul;
              }

              return val
            };

            Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) {
                checkOffset(offset, byteLength, this.length);
              }

              var val = this[offset + --byteLength];
              var mul = 1;
              while (byteLength > 0 && (mul *= 0x100)) {
                val += this[offset + --byteLength] * mul;
              }

              return val
            };

            Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 1, this.length);
              return this[offset]
            };

            Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              return this[offset] | (this[offset + 1] << 8)
            };

            Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              return (this[offset] << 8) | this[offset + 1]
            };

            Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);

              return ((this[offset]) |
                  (this[offset + 1] << 8) |
                  (this[offset + 2] << 16)) +
                  (this[offset + 3] * 0x1000000)
            };

            Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);

              return (this[offset] * 0x1000000) +
                ((this[offset + 1] << 16) |
                (this[offset + 2] << 8) |
                this[offset + 3])
            };

            Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) checkOffset(offset, byteLength, this.length);

              var val = this[offset];
              var mul = 1;
              var i = 0;
              while (++i < byteLength && (mul *= 0x100)) {
                val += this[offset + i] * mul;
              }
              mul *= 0x80;

              if (val >= mul) val -= Math.pow(2, 8 * byteLength);

              return val
            };

            Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) checkOffset(offset, byteLength, this.length);

              var i = byteLength;
              var mul = 1;
              var val = this[offset + --i];
              while (i > 0 && (mul *= 0x100)) {
                val += this[offset + --i] * mul;
              }
              mul *= 0x80;

              if (val >= mul) val -= Math.pow(2, 8 * byteLength);

              return val
            };

            Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 1, this.length);
              if (!(this[offset] & 0x80)) return (this[offset])
              return ((0xff - this[offset] + 1) * -1)
            };

            Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              var val = this[offset] | (this[offset + 1] << 8);
              return (val & 0x8000) ? val | 0xFFFF0000 : val
            };

            Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 2, this.length);
              var val = this[offset + 1] | (this[offset] << 8);
              return (val & 0x8000) ? val | 0xFFFF0000 : val
            };

            Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);

              return (this[offset]) |
                (this[offset + 1] << 8) |
                (this[offset + 2] << 16) |
                (this[offset + 3] << 24)
            };

            Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);

              return (this[offset] << 24) |
                (this[offset + 1] << 16) |
                (this[offset + 2] << 8) |
                (this[offset + 3])
            };

            Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);
              return read(this, offset, true, 23, 4)
            };

            Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 4, this.length);
              return read(this, offset, false, 23, 4)
            };

            Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 8, this.length);
              return read(this, offset, true, 52, 8)
            };

            Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
              if (!noAssert) checkOffset(offset, 8, this.length);
              return read(this, offset, false, 52, 8)
            };

            function checkInt (buf, value, offset, ext, max, min) {
              if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
              if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
              if (offset + ext > buf.length) throw new RangeError('Index out of range')
            }

            Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) {
                var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                checkInt(this, value, offset, byteLength, maxBytes, 0);
              }

              var mul = 1;
              var i = 0;
              this[offset] = value & 0xFF;
              while (++i < byteLength && (mul *= 0x100)) {
                this[offset + i] = (value / mul) & 0xFF;
              }

              return offset + byteLength
            };

            Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              byteLength = byteLength | 0;
              if (!noAssert) {
                var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                checkInt(this, value, offset, byteLength, maxBytes, 0);
              }

              var i = byteLength - 1;
              var mul = 1;
              this[offset + i] = value & 0xFF;
              while (--i >= 0 && (mul *= 0x100)) {
                this[offset + i] = (value / mul) & 0xFF;
              }

              return offset + byteLength
            };

            Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
              if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
              this[offset] = (value & 0xff);
              return offset + 1
            };

            function objectWriteUInt16 (buf, value, offset, littleEndian) {
              if (value < 0) value = 0xffff + value + 1;
              for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
                buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
                  (littleEndian ? i : 1 - i) * 8;
              }
            }

            Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value & 0xff);
                this[offset + 1] = (value >>> 8);
              } else {
                objectWriteUInt16(this, value, offset, true);
              }
              return offset + 2
            };

            Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value >>> 8);
                this[offset + 1] = (value & 0xff);
              } else {
                objectWriteUInt16(this, value, offset, false);
              }
              return offset + 2
            };

            function objectWriteUInt32 (buf, value, offset, littleEndian) {
              if (value < 0) value = 0xffffffff + value + 1;
              for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
                buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
              }
            }

            Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset + 3] = (value >>> 24);
                this[offset + 2] = (value >>> 16);
                this[offset + 1] = (value >>> 8);
                this[offset] = (value & 0xff);
              } else {
                objectWriteUInt32(this, value, offset, true);
              }
              return offset + 4
            };

            Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value >>> 24);
                this[offset + 1] = (value >>> 16);
                this[offset + 2] = (value >>> 8);
                this[offset + 3] = (value & 0xff);
              } else {
                objectWriteUInt32(this, value, offset, false);
              }
              return offset + 4
            };

            Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) {
                var limit = Math.pow(2, 8 * byteLength - 1);

                checkInt(this, value, offset, byteLength, limit - 1, -limit);
              }

              var i = 0;
              var mul = 1;
              var sub = 0;
              this[offset] = value & 0xFF;
              while (++i < byteLength && (mul *= 0x100)) {
                if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
                  sub = 1;
                }
                this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
              }

              return offset + byteLength
            };

            Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) {
                var limit = Math.pow(2, 8 * byteLength - 1);

                checkInt(this, value, offset, byteLength, limit - 1, -limit);
              }

              var i = byteLength - 1;
              var mul = 1;
              var sub = 0;
              this[offset + i] = value & 0xFF;
              while (--i >= 0 && (mul *= 0x100)) {
                if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
                  sub = 1;
                }
                this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
              }

              return offset + byteLength
            };

            Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
              if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
              if (value < 0) value = 0xff + value + 1;
              this[offset] = (value & 0xff);
              return offset + 1
            };

            Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value & 0xff);
                this[offset + 1] = (value >>> 8);
              } else {
                objectWriteUInt16(this, value, offset, true);
              }
              return offset + 2
            };

            Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value >>> 8);
                this[offset + 1] = (value & 0xff);
              } else {
                objectWriteUInt16(this, value, offset, false);
              }
              return offset + 2
            };

            Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value & 0xff);
                this[offset + 1] = (value >>> 8);
                this[offset + 2] = (value >>> 16);
                this[offset + 3] = (value >>> 24);
              } else {
                objectWriteUInt32(this, value, offset, true);
              }
              return offset + 4
            };

            Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
              value = +value;
              offset = offset | 0;
              if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
              if (value < 0) value = 0xffffffff + value + 1;
              if (Buffer.TYPED_ARRAY_SUPPORT) {
                this[offset] = (value >>> 24);
                this[offset + 1] = (value >>> 16);
                this[offset + 2] = (value >>> 8);
                this[offset + 3] = (value & 0xff);
              } else {
                objectWriteUInt32(this, value, offset, false);
              }
              return offset + 4
            };

            function checkIEEE754 (buf, value, offset, ext, max, min) {
              if (offset + ext > buf.length) throw new RangeError('Index out of range')
              if (offset < 0) throw new RangeError('Index out of range')
            }

            function writeFloat (buf, value, offset, littleEndian, noAssert) {
              if (!noAssert) {
                checkIEEE754(buf, value, offset, 4);
              }
              write(buf, value, offset, littleEndian, 23, 4);
              return offset + 4
            }

            Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
              return writeFloat(this, value, offset, true, noAssert)
            };

            Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
              return writeFloat(this, value, offset, false, noAssert)
            };

            function writeDouble (buf, value, offset, littleEndian, noAssert) {
              if (!noAssert) {
                checkIEEE754(buf, value, offset, 8);
              }
              write(buf, value, offset, littleEndian, 52, 8);
              return offset + 8
            }

            Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
              return writeDouble(this, value, offset, true, noAssert)
            };

            Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
              return writeDouble(this, value, offset, false, noAssert)
            };

            // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
            Buffer.prototype.copy = function copy (target, targetStart, start, end) {
              if (!start) start = 0;
              if (!end && end !== 0) end = this.length;
              if (targetStart >= target.length) targetStart = target.length;
              if (!targetStart) targetStart = 0;
              if (end > 0 && end < start) end = start;

              // Copy 0 bytes; we're done
              if (end === start) return 0
              if (target.length === 0 || this.length === 0) return 0

              // Fatal error conditions
              if (targetStart < 0) {
                throw new RangeError('targetStart out of bounds')
              }
              if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
              if (end < 0) throw new RangeError('sourceEnd out of bounds')

              // Are we oob?
              if (end > this.length) end = this.length;
              if (target.length - targetStart < end - start) {
                end = target.length - targetStart + start;
              }

              var len = end - start;
              var i;

              if (this === target && start < targetStart && targetStart < end) {
                // descending copy from end
                for (i = len - 1; i >= 0; --i) {
                  target[i + targetStart] = this[i + start];
                }
              } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
                // ascending copy from start
                for (i = 0; i < len; ++i) {
                  target[i + targetStart] = this[i + start];
                }
              } else {
                Uint8Array.prototype.set.call(
                  target,
                  this.subarray(start, start + len),
                  targetStart
                );
              }

              return len
            };

            // Usage:
            //    buffer.fill(number[, offset[, end]])
            //    buffer.fill(buffer[, offset[, end]])
            //    buffer.fill(string[, offset[, end]][, encoding])
            Buffer.prototype.fill = function fill (val, start, end, encoding) {
              // Handle string cases:
              if (typeof val === 'string') {
                if (typeof start === 'string') {
                  encoding = start;
                  start = 0;
                  end = this.length;
                } else if (typeof end === 'string') {
                  encoding = end;
                  end = this.length;
                }
                if (val.length === 1) {
                  var code = val.charCodeAt(0);
                  if (code < 256) {
                    val = code;
                  }
                }
                if (encoding !== undefined && typeof encoding !== 'string') {
                  throw new TypeError('encoding must be a string')
                }
                if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
                  throw new TypeError('Unknown encoding: ' + encoding)
                }
              } else if (typeof val === 'number') {
                val = val & 255;
              }

              // Invalid ranges are not set to a default, so can range check early.
              if (start < 0 || this.length < start || this.length < end) {
                throw new RangeError('Out of range index')
              }

              if (end <= start) {
                return this
              }

              start = start >>> 0;
              end = end === undefined ? this.length : end >>> 0;

              if (!val) val = 0;

              var i;
              if (typeof val === 'number') {
                for (i = start; i < end; ++i) {
                  this[i] = val;
                }
              } else {
                var bytes = internalIsBuffer(val)
                  ? val
                  : utf8ToBytes(new Buffer(val, encoding).toString());
                var len = bytes.length;
                for (i = 0; i < end - start; ++i) {
                  this[i + start] = bytes[i % len];
                }
              }

              return this
            };

            // HELPER FUNCTIONS
            // ================

            var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

            function base64clean (str) {
              // Node strips out invalid characters like \n and \t from the string, base64-js does not
              str = stringtrim(str).replace(INVALID_BASE64_RE, '');
              // Node converts strings with length < 2 to ''
              if (str.length < 2) return ''
              // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
              while (str.length % 4 !== 0) {
                str = str + '=';
              }
              return str
            }

            function stringtrim (str) {
              if (str.trim) return str.trim()
              return str.replace(/^\s+|\s+$/g, '')
            }

            function toHex (n) {
              if (n < 16) return '0' + n.toString(16)
              return n.toString(16)
            }

            function utf8ToBytes (string, units) {
              units = units || Infinity;
              var codePoint;
              var length = string.length;
              var leadSurrogate = null;
              var bytes = [];

              for (var i = 0; i < length; ++i) {
                codePoint = string.charCodeAt(i);

                // is surrogate component
                if (codePoint > 0xD7FF && codePoint < 0xE000) {
                  // last char was a lead
                  if (!leadSurrogate) {
                    // no lead yet
                    if (codePoint > 0xDBFF) {
                      // unexpected trail
                      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                      continue
                    } else if (i + 1 === length) {
                      // unpaired lead
                      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                      continue
                    }

                    // valid lead
                    leadSurrogate = codePoint;

                    continue
                  }

                  // 2 leads in a row
                  if (codePoint < 0xDC00) {
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    leadSurrogate = codePoint;
                    continue
                  }

                  // valid surrogate pair
                  codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
                } else if (leadSurrogate) {
                  // valid bmp char, but last char was a lead
                  if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                }

                leadSurrogate = null;

                // encode utf8
                if (codePoint < 0x80) {
                  if ((units -= 1) < 0) break
                  bytes.push(codePoint);
                } else if (codePoint < 0x800) {
                  if ((units -= 2) < 0) break
                  bytes.push(
                    codePoint >> 0x6 | 0xC0,
                    codePoint & 0x3F | 0x80
                  );
                } else if (codePoint < 0x10000) {
                  if ((units -= 3) < 0) break
                  bytes.push(
                    codePoint >> 0xC | 0xE0,
                    codePoint >> 0x6 & 0x3F | 0x80,
                    codePoint & 0x3F | 0x80
                  );
                } else if (codePoint < 0x110000) {
                  if ((units -= 4) < 0) break
                  bytes.push(
                    codePoint >> 0x12 | 0xF0,
                    codePoint >> 0xC & 0x3F | 0x80,
                    codePoint >> 0x6 & 0x3F | 0x80,
                    codePoint & 0x3F | 0x80
                  );
                } else {
                  throw new Error('Invalid code point')
                }
              }

              return bytes
            }

            function asciiToBytes (str) {
              var byteArray = [];
              for (var i = 0; i < str.length; ++i) {
                // Node's code seems to be doing this and not & 0x7F..
                byteArray.push(str.charCodeAt(i) & 0xFF);
              }
              return byteArray
            }

            function utf16leToBytes (str, units) {
              var c, hi, lo;
              var byteArray = [];
              for (var i = 0; i < str.length; ++i) {
                if ((units -= 2) < 0) break

                c = str.charCodeAt(i);
                hi = c >> 8;
                lo = c % 256;
                byteArray.push(lo);
                byteArray.push(hi);
              }

              return byteArray
            }


            function base64ToBytes (str) {
              return toByteArray(base64clean(str))
            }

            function blitBuffer (src, dst, offset, length) {
              for (var i = 0; i < length; ++i) {
                if ((i + offset >= dst.length) || (i >= src.length)) break
                dst[i + offset] = src[i];
              }
              return i
            }

            function isnan (val) {
              return val !== val // eslint-disable-line no-self-compare
            }


            // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
            // The _isBuffer check is for Safari 5-7 support, because it's missing
            // Object.prototype.constructor. Remove this eventually
            function isBuffer(obj) {
              return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
            }

            function isFastBuffer (obj) {
              return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
            }

            // For Node v0.10 support. Remove this eventually.
            function isSlowBuffer (obj) {
              return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
            }

            var TINF_OK = 0;
            var TINF_DATA_ERROR = -3;

            function Tree() {
              this.table = new Uint16Array(16);   /* table of code length counts */
              this.trans = new Uint16Array(288);  /* code -> symbol translation table */
            }

            function Data(source, dest) {
              this.source = source;
              this.sourceIndex = 0;
              this.tag = 0;
              this.bitcount = 0;
              
              this.dest = dest;
              this.destLen = 0;
              
              this.ltree = new Tree();  /* dynamic length/symbol tree */
              this.dtree = new Tree();  /* dynamic distance tree */
            }

            /* --------------------------------------------------- *
             * -- uninitialized global data (static structures) -- *
             * --------------------------------------------------- */

            var sltree = new Tree();
            var sdtree = new Tree();

            /* extra bits and base tables for length codes */
            var length_bits = new Uint8Array(30);
            var length_base = new Uint16Array(30);

            /* extra bits and base tables for distance codes */
            var dist_bits = new Uint8Array(30);
            var dist_base = new Uint16Array(30);

            /* special ordering of code length codes */
            var clcidx = new Uint8Array([
              16, 17, 18, 0, 8, 7, 9, 6,
              10, 5, 11, 4, 12, 3, 13, 2,
              14, 1, 15
            ]);

            /* used by tinf_decode_trees, avoids allocations every call */
            var code_tree = new Tree();
            var lengths = new Uint8Array(288 + 32);

            /* ----------------------- *
             * -- utility functions -- *
             * ----------------------- */

            /* build extra bits and base tables */
            function tinf_build_bits_base(bits, base, delta, first) {
              var i, sum;

              /* build bits table */
              for (i = 0; i < delta; ++i) bits[i] = 0;
              for (i = 0; i < 30 - delta; ++i) bits[i + delta] = i / delta | 0;

              /* build base table */
              for (sum = first, i = 0; i < 30; ++i) {
                base[i] = sum;
                sum += 1 << bits[i];
              }
            }

            /* build the fixed huffman trees */
            function tinf_build_fixed_trees(lt, dt) {
              var i;

              /* build fixed length tree */
              for (i = 0; i < 7; ++i) lt.table[i] = 0;

              lt.table[7] = 24;
              lt.table[8] = 152;
              lt.table[9] = 112;

              for (i = 0; i < 24; ++i) lt.trans[i] = 256 + i;
              for (i = 0; i < 144; ++i) lt.trans[24 + i] = i;
              for (i = 0; i < 8; ++i) lt.trans[24 + 144 + i] = 280 + i;
              for (i = 0; i < 112; ++i) lt.trans[24 + 144 + 8 + i] = 144 + i;

              /* build fixed distance tree */
              for (i = 0; i < 5; ++i) dt.table[i] = 0;

              dt.table[5] = 32;

              for (i = 0; i < 32; ++i) dt.trans[i] = i;
            }

            /* given an array of code lengths, build a tree */
            var offs = new Uint16Array(16);

            function tinf_build_tree(t, lengths, off, num) {
              var i, sum;

              /* clear code length count table */
              for (i = 0; i < 16; ++i) t.table[i] = 0;

              /* scan symbol lengths, and sum code length counts */
              for (i = 0; i < num; ++i) t.table[lengths[off + i]]++;

              t.table[0] = 0;

              /* compute offset table for distribution sort */
              for (sum = 0, i = 0; i < 16; ++i) {
                offs[i] = sum;
                sum += t.table[i];
              }

              /* create code->symbol translation table (symbols sorted by code) */
              for (i = 0; i < num; ++i) {
                if (lengths[off + i]) t.trans[offs[lengths[off + i]]++] = i;
              }
            }

            /* ---------------------- *
             * -- decode functions -- *
             * ---------------------- */

            /* get one bit from source stream */
            function tinf_getbit(d) {
              /* check if tag is empty */
              if (!d.bitcount--) {
                /* load next tag */
                d.tag = d.source[d.sourceIndex++];
                d.bitcount = 7;
              }

              /* shift bit out of tag */
              var bit = d.tag & 1;
              d.tag >>>= 1;

              return bit;
            }

            /* read a num bit value from a stream and add base */
            function tinf_read_bits(d, num, base) {
              if (!num)
                return base;

              while (d.bitcount < 24) {
                d.tag |= d.source[d.sourceIndex++] << d.bitcount;
                d.bitcount += 8;
              }

              var val = d.tag & (0xffff >>> (16 - num));
              d.tag >>>= num;
              d.bitcount -= num;
              return val + base;
            }

            /* given a data stream and a tree, decode a symbol */
            function tinf_decode_symbol(d, t) {
              while (d.bitcount < 24) {
                d.tag |= d.source[d.sourceIndex++] << d.bitcount;
                d.bitcount += 8;
              }
              
              var sum = 0, cur = 0, len = 0;
              var tag = d.tag;

              /* get more bits while code value is above sum */
              do {
                cur = 2 * cur + (tag & 1);
                tag >>>= 1;
                ++len;

                sum += t.table[len];
                cur -= t.table[len];
              } while (cur >= 0);
              
              d.tag = tag;
              d.bitcount -= len;

              return t.trans[sum + cur];
            }

            /* given a data stream, decode dynamic trees from it */
            function tinf_decode_trees(d, lt, dt) {
              var hlit, hdist, hclen;
              var i, num, length;

              /* get 5 bits HLIT (257-286) */
              hlit = tinf_read_bits(d, 5, 257);

              /* get 5 bits HDIST (1-32) */
              hdist = tinf_read_bits(d, 5, 1);

              /* get 4 bits HCLEN (4-19) */
              hclen = tinf_read_bits(d, 4, 4);

              for (i = 0; i < 19; ++i) lengths[i] = 0;

              /* read code lengths for code length alphabet */
              for (i = 0; i < hclen; ++i) {
                /* get 3 bits code length (0-7) */
                var clen = tinf_read_bits(d, 3, 0);
                lengths[clcidx[i]] = clen;
              }

              /* build code length tree */
              tinf_build_tree(code_tree, lengths, 0, 19);

              /* decode code lengths for the dynamic trees */
              for (num = 0; num < hlit + hdist;) {
                var sym = tinf_decode_symbol(d, code_tree);

                switch (sym) {
                  case 16:
                    /* copy previous code length 3-6 times (read 2 bits) */
                    var prev = lengths[num - 1];
                    for (length = tinf_read_bits(d, 2, 3); length; --length) {
                      lengths[num++] = prev;
                    }
                    break;
                  case 17:
                    /* repeat code length 0 for 3-10 times (read 3 bits) */
                    for (length = tinf_read_bits(d, 3, 3); length; --length) {
                      lengths[num++] = 0;
                    }
                    break;
                  case 18:
                    /* repeat code length 0 for 11-138 times (read 7 bits) */
                    for (length = tinf_read_bits(d, 7, 11); length; --length) {
                      lengths[num++] = 0;
                    }
                    break;
                  default:
                    /* values 0-15 represent the actual code lengths */
                    lengths[num++] = sym;
                    break;
                }
              }

              /* build dynamic trees */
              tinf_build_tree(lt, lengths, 0, hlit);
              tinf_build_tree(dt, lengths, hlit, hdist);
            }

            /* ----------------------------- *
             * -- block inflate functions -- *
             * ----------------------------- */

            /* given a stream and two trees, inflate a block of data */
            function tinf_inflate_block_data(d, lt, dt) {
              while (1) {
                var sym = tinf_decode_symbol(d, lt);

                /* check for end of block */
                if (sym === 256) {
                  return TINF_OK;
                }

                if (sym < 256) {
                  d.dest[d.destLen++] = sym;
                } else {
                  var length, dist, offs;
                  var i;

                  sym -= 257;

                  /* possibly get more bits from length code */
                  length = tinf_read_bits(d, length_bits[sym], length_base[sym]);

                  dist = tinf_decode_symbol(d, dt);

                  /* possibly get more bits from distance code */
                  offs = d.destLen - tinf_read_bits(d, dist_bits[dist], dist_base[dist]);

                  /* copy match */
                  for (i = offs; i < offs + length; ++i) {
                    d.dest[d.destLen++] = d.dest[i];
                  }
                }
              }
            }

            /* inflate an uncompressed block of data */
            function tinf_inflate_uncompressed_block(d) {
              var length, invlength;
              var i;
              
              /* unread from bitbuffer */
              while (d.bitcount > 8) {
                d.sourceIndex--;
                d.bitcount -= 8;
              }

              /* get length */
              length = d.source[d.sourceIndex + 1];
              length = 256 * length + d.source[d.sourceIndex];

              /* get one's complement of length */
              invlength = d.source[d.sourceIndex + 3];
              invlength = 256 * invlength + d.source[d.sourceIndex + 2];

              /* check length */
              if (length !== (~invlength & 0x0000ffff))
                return TINF_DATA_ERROR;

              d.sourceIndex += 4;

              /* copy block */
              for (i = length; i; --i)
                d.dest[d.destLen++] = d.source[d.sourceIndex++];

              /* make sure we start next block on a byte boundary */
              d.bitcount = 0;

              return TINF_OK;
            }

            /* inflate stream from source to dest */
            function tinf_uncompress(source, dest) {
              var d = new Data(source, dest);
              var bfinal, btype, res;

              do {
                /* read final block flag */
                bfinal = tinf_getbit(d);

                /* read block type (2 bits) */
                btype = tinf_read_bits(d, 2, 0);

                /* decompress block */
                switch (btype) {
                  case 0:
                    /* decompress uncompressed block */
                    res = tinf_inflate_uncompressed_block(d);
                    break;
                  case 1:
                    /* decompress block with fixed huffman trees */
                    res = tinf_inflate_block_data(d, sltree, sdtree);
                    break;
                  case 2:
                    /* decompress block with dynamic huffman trees */
                    tinf_decode_trees(d, d.ltree, d.dtree);
                    res = tinf_inflate_block_data(d, d.ltree, d.dtree);
                    break;
                  default:
                    res = TINF_DATA_ERROR;
                }

                if (res !== TINF_OK)
                  throw new Error('Data error');

              } while (!bfinal);

              if (d.destLen < d.dest.length) {
                if (typeof d.dest.slice === 'function')
                  return d.dest.slice(0, d.destLen);
                else
                  return d.dest.subarray(0, d.destLen);
              }
              
              return d.dest;
            }

            /* -------------------- *
             * -- initialization -- *
             * -------------------- */

            /* build fixed huffman trees */
            tinf_build_fixed_trees(sltree, sdtree);

            /* build extra bits and base tables */
            tinf_build_bits_base(length_bits, length_base, 4, 3);
            tinf_build_bits_base(dist_bits, dist_base, 2, 1);

            /* fix a special case */
            length_bits[28] = 0;
            length_base[28] = 258;

            var tinyInflate = tinf_uncompress;

            const isBigEndian = (new Uint8Array(new Uint32Array([0x12345678]).buffer)[0] === 0x12);

            const swap = (b, n, m) => {
              let i = b[n];
              b[n] = b[m];
              b[m] = i;
            };

            const swap32 = array => {
              const len = array.length;
              for (let i = 0; i < len; i += 4) {
                swap(array, i, i + 3);
                swap(array, i + 1, i + 2);
              }
            };

            const swap32LE$1 = array => {
              if (isBigEndian) {
                swap32(array);
              }
            };

            var swap_1 = {
              swap32LE: swap32LE$1
            };

            const { swap32LE } = swap_1;

            // Shift size for getting the index-1 table offset.
            const SHIFT_1 = 6 + 5;

            // Shift size for getting the index-2 table offset.
            const SHIFT_2 = 5;

            // Difference between the two shift sizes,
            // for getting an index-1 offset from an index-2 offset. 6=11-5
            const SHIFT_1_2 = SHIFT_1 - SHIFT_2;

            // Number of index-1 entries for the BMP. 32=0x20
            // This part of the index-1 table is omitted from the serialized form.
            const OMITTED_BMP_INDEX_1_LENGTH = 0x10000 >> SHIFT_1;

            // Number of entries in an index-2 block. 64=0x40
            const INDEX_2_BLOCK_LENGTH = 1 << SHIFT_1_2;

            // Mask for getting the lower bits for the in-index-2-block offset. */
            const INDEX_2_MASK = INDEX_2_BLOCK_LENGTH - 1;

            // Shift size for shifting left the index array values.
            // Increases possible data size with 16-bit index values at the cost
            // of compactability.
            // This requires data blocks to be aligned by DATA_GRANULARITY.
            const INDEX_SHIFT = 2;

            // Number of entries in a data block. 32=0x20
            const DATA_BLOCK_LENGTH = 1 << SHIFT_2;

            // Mask for getting the lower bits for the in-data-block offset.
            const DATA_MASK = DATA_BLOCK_LENGTH - 1;

            // The part of the index-2 table for U+D800..U+DBFF stores values for
            // lead surrogate code _units_ not code _points_.
            // Values for lead surrogate code _points_ are indexed with this portion of the table.
            // Length=32=0x20=0x400>>SHIFT_2. (There are 1024=0x400 lead surrogates.)
            const LSCP_INDEX_2_OFFSET = 0x10000 >> SHIFT_2;
            const LSCP_INDEX_2_LENGTH = 0x400 >> SHIFT_2;

            // Count the lengths of both BMP pieces. 2080=0x820
            const INDEX_2_BMP_LENGTH = LSCP_INDEX_2_OFFSET + LSCP_INDEX_2_LENGTH;

            // The 2-byte UTF-8 version of the index-2 table follows at offset 2080=0x820.
            // Length 32=0x20 for lead bytes C0..DF, regardless of SHIFT_2.
            const UTF8_2B_INDEX_2_OFFSET = INDEX_2_BMP_LENGTH;
            const UTF8_2B_INDEX_2_LENGTH = 0x800 >> 6;  // U+0800 is the first code point after 2-byte UTF-8

            // The index-1 table, only used for supplementary code points, at offset 2112=0x840.
            // Variable length, for code points up to highStart, where the last single-value range starts.
            // Maximum length 512=0x200=0x100000>>SHIFT_1.
            // (For 0x100000 supplementary code points U+10000..U+10ffff.)
            //
            // The part of the index-2 table for supplementary code points starts
            // after this index-1 table.
            //
            // Both the index-1 table and the following part of the index-2 table
            // are omitted completely if there is only BMP data.
            const INDEX_1_OFFSET = UTF8_2B_INDEX_2_OFFSET + UTF8_2B_INDEX_2_LENGTH;

            // The alignment size of a data block. Also the granularity for compaction.
            const DATA_GRANULARITY = 1 << INDEX_SHIFT;

            class UnicodeTrie {
              constructor(data) {
                const isBuffer = (typeof data.readUInt32BE === 'function') && (typeof data.slice === 'function');

                if (isBuffer || data instanceof Uint8Array) {
                  // read binary format
                  let uncompressedLength;
                  if (isBuffer) {
                    this.highStart = data.readUInt32LE(0);
                    this.errorValue = data.readUInt32LE(4);
                    uncompressedLength = data.readUInt32LE(8);
                    data = data.slice(12);
                  } else {
                    const view = new DataView(data.buffer);
                    this.highStart = view.getUint32(0, true);
                    this.errorValue = view.getUint32(4, true);
                    uncompressedLength = view.getUint32(8, true);
                    data = data.subarray(12);
                  }

                  // double inflate the actual trie data
                  data = tinyInflate(data, new Uint8Array(uncompressedLength));
                  data = tinyInflate(data, new Uint8Array(uncompressedLength));

                  // swap bytes from little-endian
                  swap32LE(data);

                  this.data = new Uint32Array(data.buffer);

                } else {
                  // pre-parsed data
                  ({ data: this.data, highStart: this.highStart, errorValue: this.errorValue } = data);
                }
              }

              get(codePoint) {
                let index;
                if ((codePoint < 0) || (codePoint > 0x10ffff)) {
                  return this.errorValue;
                }

                if ((codePoint < 0xd800) || ((codePoint > 0xdbff) && (codePoint <= 0xffff))) {
                  // Ordinary BMP code point, excluding leading surrogates.
                  // BMP uses a single level lookup.  BMP index starts at offset 0 in the index.
                  // data is stored in the index array itself.
                  index = (this.data[codePoint >> SHIFT_2] << INDEX_SHIFT) + (codePoint & DATA_MASK);
                  return this.data[index];
                }

                if (codePoint <= 0xffff) {
                  // Lead Surrogate Code Point.  A Separate index section is stored for
                  // lead surrogate code units and code points.
                  //   The main index has the code unit data.
                  //   For this function, we need the code point data.
                  index = (this.data[LSCP_INDEX_2_OFFSET + ((codePoint - 0xd800) >> SHIFT_2)] << INDEX_SHIFT) + (codePoint & DATA_MASK);
                  return this.data[index];
                }

                if (codePoint < this.highStart) {
                  // Supplemental code point, use two-level lookup.
                  index = this.data[(INDEX_1_OFFSET - OMITTED_BMP_INDEX_1_LENGTH) + (codePoint >> SHIFT_1)];
                  index = this.data[index + ((codePoint >> SHIFT_2) & INDEX_2_MASK)];
                  index = (index << INDEX_SHIFT) + (codePoint & DATA_MASK);
                  return this.data[index];
                }

                return this.data[this.data.length - DATA_GRANULARITY];
              }
            }

            var unicodeTrie = UnicodeTrie;

            var XX = 0; // Unknown

            // WordBreakProperty.txt
            var Double_Quote = 1;
            var Single_Quote = 2;
            var Hebrew_Letter = 3;
            var CR = 4;
            var LF = 5;
            var Newline = 6;
            var Extend = 7;
            var Regional_Indicator = 8;
            var Format = 9;
            var Katakana = 10;
            var ALetter = 11;
            var MidLetter = 12;
            var MidNum = 13;
            var MidNumLet = 14;
            var Numeric = 15;
            var ExtendNumLet = 16;
            var ZWJ = 17;
            var WSegSpace = 18;

            // emoji-data.txt
            var Extended_Pictographic = 19;

            // mapped classes in Unicode 12
            var AHLetter = 20;
            var MidNumLetQ = 21;

            var classes = {
            	XX: XX,
            	Double_Quote: Double_Quote,
            	Single_Quote: Single_Quote,
            	Hebrew_Letter: Hebrew_Letter,
            	CR: CR,
            	LF: LF,
            	Newline: Newline,
            	Extend: Extend,
            	Regional_Indicator: Regional_Indicator,
            	Format: Format,
            	Katakana: Katakana,
            	ALetter: ALetter,
            	MidLetter: MidLetter,
            	MidNum: MidNum,
            	MidNumLet: MidNumLet,
            	Numeric: Numeric,
            	ExtendNumLet: ExtendNumLet,
            	ZWJ: ZWJ,
            	WSegSpace: WSegSpace,
            	Extended_Pictographic: Extended_Pictographic,
            	AHLetter: AHLetter,
            	MidNumLetQ: MidNumLetQ
            };

            const {
              Double_Quote: Double_Quote$1,
              Single_Quote: Single_Quote$1,
              Hebrew_Letter: Hebrew_Letter$1,
              CR: CR$1,
              LF: LF$1,
              Newline: Newline$1,
              Extend: Extend$1,
              Regional_Indicator: Regional_Indicator$1,
              Format: Format$1,
              Katakana: Katakana$1,
              ALetter: ALetter$1,
              MidLetter: MidLetter$1,
              MidNum: MidNum$1,
              MidNumLet: MidNumLet$1,
              Numeric: Numeric$1,
              ExtendNumLet: ExtendNumLet$1,
              ZWJ: ZWJ$1,
              WSegSpace: WSegSpace$1,
              Extended_Pictographic: Extended_Pictographic$1,
              AHLetter: AHLetter$1,
              MidNumLetQ: MidNumLetQ$1
            } = classes;

            const classTrie = new unicodeTrie(Buffer("AA4IAAAAAAAAAOkQAdkOJvHtXQmsXUUZnvbt9953+3hlMQhFtLQlKaCRxWALRChLoDYEKzFQGwJIEAuyKIJVC0IEhUDVilUUCoggBouoFJW2VBFFTRXRqiAFDZQqmya0KmnrN545ufOms2/nUs6ffJmzzMy//zP33HPfu62HkG8D3wN+DPwOeBz4G/AP4J/AfzzaV4GeXkKawERgArAbsBcwFZgGvLV3+3HvwLUjuOszcHwUcBxwInAyMB84CzgPuBj4FHAlcC037vM4/gpwC/AtYDmwArgPWAU8DKwFNgNbgf4+Qu5uENLuK+bYFe0kYB9gKnAAcAhwODALmA3MBeYBpwPnABcCHwcuA64GFgNL2fky4E7gHuB+4EF6fZiQX6BdC6wD1gMbgBeAV4AtQF8/IQ1gFNgdeDPwXci5L9q3AT+BrAejncmOKY7C8Qns/D1oTwWOho5noD0HuAC4lOu/CMdXAdcDX+4v9P8hePyd+cUGqxtF+3O0K4HfsPNfsfZmxu8Pjc6YJ3F8b689DxOexXwvcvNvwvEd4LscWAGsZjI8hPYR4PEBQh7t7/Tfiv5/xvlT7Fp/k5CNaJ/rL3xV2ovi+lbRvszm3Ix2G3A1+v0M7cBAcX0C2n4a+2gnAVOA/QeK+Q9i7Uy0bfDaBfgvZNgT7ZG4dtyAWtcmyy2TTZ5k9tiHzU+P90N7EDATOBE8XsI8l0DuY9C32Sjkpjq8D/dmoc9sYC4bOw/tMsEWOtyGvndx/cvj5Wh/oJjnDPD4EHBBU37/AYx7CHgYWAs8xuFx4fyvwEbgZeDfwKtAT9tefoqmY38eo2zs7oo5dL47baCTi7Q9G+cPoL20WYD6n85xucJONvgsxp4/0Dm/BMcXNwpcAixuFvW3lGkVa2nfCxvbz/emdufexxqduRZJ+taoUaNGjRo1atSoUaNGjXyI9ewlFr7EPsuO7+s8r9Dh6+hzO+t3GT673s99Vr0a57198nF3Y8z3gcXos7T8nI3zQ3uL5zXLcO3OgeI54T1oVwBrmsXzwE/j2mp6j41bi3Yd8CT7HP0s2heBTcAjGPMok++Pgj5bNc93atSoUaNGfKxEHV5Pn7X3VL/+1qhRY8fFOuwV1wMbuH3ph1F7NljsbUvQffB4to99no37F9pNQP8gIW3gg8OEbBHmnNMg5Pzhznf7n8H5roPFd5p9LUJO7oLvZEYmFDgBuAb4qQbPA9NHCJkBLARuHunce4odv4x28k6EnArcCDwB7Dxa3DsW7VXAauAJYI+JhDw9RMjesMNpwLJG8X0l/U5xPPDVcYRMaBctj6cb21/jMRljzwD2bhbnxzSL7+jo54fxsPu7gMuBOZK5a9SoUaPG6wNrsA7Mwt5gGO0u7J0ifg3fs9VZK+n5F4V3PSYNbr+mrmH7gCVopwwWx9c1i/fb9h/sPFfbR8Kv3G9Mw7q4X6v4jESvvb1VtIeiPQw4UpDLBPreCn2fiu5bpkDf47nxJ+H4va3iPu23kdPl/ez6uc2x/F7l+hwMnWYOdnRfw/rSd95mMf3pHBQr2f6Lt1cp4wc4e6wU2tkSO6tA+88dHOuPBZh73mCxjzuTtRe1Cn3pO2F9kHUBrl80WJwvRHsFsLBVnH8Ox18AbmD36TPImxiPt+D4mxy/K1rFe2SLcP07uH4f8ADwEPBriR5U3n0x5+9x7xrm5wGM/YtCZ3r/Gdx7YbBzTvu/wp1vGSzer6PnvYil1pDeXjsPbX/t//EOeW4E9sD9yVyfW3BtOs4PBGYARwDHDrF971Bnv7zVYo97B90LY8zyVvFMeD6Oz+R4rcD1BTj/CLAKx58Y6uhmwpUKvR92zB8TqJ40b6YxG5TH17LzJWjXgef6VvEOZoq9fCmL6vrXhop31m7lbHKXJi5ygbfjBtjnXsh0Vhd8NkoN6osfDRV1x2ksxvwS+K3Ed3/y9Gdp/2+w+vMS2s3ANnbej89T44D2sH1OvBG5PDpcvMdM56V4pqcAzXmKN+D+Yof3WXW2fJrF93NoXwI2d0Fsl9houL8Nsg5oYp7acwLuT7K0Fa2/u7H3Vvfq8lyaoompqY2x8XlAl+pC82R/6HEwcBhwNPBuh7h+bFiPqW3saYaL7zBPQXs6ML1d3DscNjkQx+8Ejmyb5xJxSMOu31LgeMP8c9pyfXhdT+LexT6FzXdeo/NOffleNQ/+nojDLfcC3YwU37O4Yn6X5lYuXAf9b7CwwU2sz+07oL1yx9y5is+CFKs049a2qrFPlRjPvUuzJOA3J90WKw968j+drSNns/Z8tB/l1qdP4vgy4CqPNbHbQdfiW3vGEVtC6JB+hl7rUWYaZa1MkvGSa8OsbbN2giVa3FiRmpkg0kjF/GsqqL9qAQSaSMb6a4hdU1HZtyW5JuubMr5yxXI38u8GqKhquUoMvM5hiluVv4aF+yLRey3FvLL5YsRZ1bGUOo9c+7v6fUeAq51Cecn4ldfE+K8Kplytugb5gAit6thEPRlh4l3GjAsNKaCiYTL2c4erzcW5q45tHinizPbzHGFtaVtephz1TqdD6TPTWiDLI7GPrT1UdTKEhjg5d4QY4+2yo8HFDiFx4ROP3WwTMWf4elKSbey4ku0cPUwGl3XPd73UXSeKvi78Qn0qUps7pmt5+YxStkaPbDfaTPxzl5EI8tvGqip+xeuqfrEod5668tf1oWTan9nWhxi1JgRDGXiE6J8yJmLa1zSXq3wluexbY+eLTY4QzbkrTGMJGctH1r8kG5/wfWXn5Rwm0tUXUUZf/4r6majsq9JLlEtmQ5kuunGx/Gs65vWyWaN0/hX76cgmHkWy9a+sTpjkEck1f2U+sR0X07+++SuLAdl5ySuEQvPXloeLnjb+IJpzF/jWTx3p+sWun4SEx0ApsynWZXqoxsj6Ekl/VT8VH9l12xzmyVRfdTFqm382dc5nT0UM57Hrm4t9bfcntvbV2UxmByI5Tl3fdCTaQpS52/yr6ltSbv/KSCZraP3U5bGNrLa5m8K/vuBlDvWnyn4iPx3JZCspdr7qfOOz37T1u4m/qr/MdiZ/6fqYcszV3jZ5bUuqPZdLDTGNLcfnWgdEuWxldLWpaY5QfX3rpC3FjktbnrJWJldo3vNz+cIkj+9cVcGGYtUWF0qhZ6p6Y7Kpzuc2+rrw8pHXNk5dnzuJMubcX8l0jb13c/FBir2jq/9j83clXz+K5yGxr6PXUm3l+ZTft8XYX6h8nStvS1628oXkrav/QsentluMtcFErmtGbrjKGZK7JpLNmyuPVDFhU29LSvn5LIUPqrJzSI3hZbW1dwoZfOwdi2+qHIxRj1Trk8ruMluIeVXSqAbi/VL+nYj5PaGS2mTsO2ciVe0jU/3R9ZX5KAZ/G1mIxX0TudhOZXv6vl9DAhmVOul+m5mCSlllssWss0RyTRezMWu9L6lqimvdSbVuiRSjJovzhdSU0P1JrHXKpn40udZmHbGpuan9H7v2h+ZKjP1ozvhKZXdbHVzrhzh3Fd/P2FKsPYg4p2puHS9xDaqKYtV73zXOtYbFjrfQOs7/9lH3N1hS8edphLj/BkS2F8yB2HnoQmKOVklV7s2IpC8x9DftY0SdUuoo2zfp9FWtZzlj0eQnE+XYX5T2lMkk2tuVYuxpQsjX7rEolV6u5PK9rGgzW//b7B996pjJfrLnXC725cenrsm2evnmvavfYuvLz2tDqjVF7KNas1yeh8vkSu1Tnd4y3Vznir0ftrEJEfqJ564wjRV5mdYvk59E3WW24HVSkW6PpYobGS+dn0PXDR0fU95R8o0vlR9EP5oo1/7HNdd5PX1rQAyyiTOxvwvltL/PWumqTwryXedlsZE73mPK7sPfVh4i4SuLBbHuuFKV9SZW3eHra+r6I5JLTMWwla8dZfdNZNPHNady5KluDUhlXzFnU8UAseQTIqNL/RMpZRzzJKuRNvFvolz10OQblT58DITw95HRhlLEtQulrKGx+YukqtOxcjRmLSp1dfWPj0958rGr63hxjpi1M8S3KrvZ1EoZVH8LtUQMnVJRaj45dDDxjY1YvGx0cNE3Falkj51/oTLFks01L018U1DI3kAlZwmbOUL2BTEodD+SYn/qQqG54bLfkskWqv/EjJDppOo7mAmqv31u2gvwfV1jpqTQvXnIXrXUMQfp/q58qB62PrKRLZc9ZDJURVW9D6b6TUIOHt1kl1BytSGRHFdJMW0Ryj+HDL77PJ/xprld+pn4i/1EmWPKL5vHZn4SOD6Uf2r9YvncNEcIxbCPTi7f+yFzu2A0oQ1sfOU7PlaMVKV3av625PN5jefj8r5blZDJ3k08TX1t5yKGNpWetjLJ9LAZr9LfZBeRQvwYQ35+vO6aq+1NOoo0keural105MH/XtvVljq/xSBff6tI9bwoNbnG8ESPMTGRimxyI+X9UNlDaVRyLaW9ZfRajqVQ/qG6uO6fYlOo3cVcUc1ZpdwpYyt37MtkNPULve+rf+j9GH6rwu45409HMeXpBn1klFue0Dg2yZ3ivkl+Hz1sdY01t438KceH8OTJ1MfFpiZeNvxj6+hjk5jyuZLr3Lb3Q3Vx5eWjjy9vna1NfWPYxlUHUb6YtrLhqSNfO6cgG16x7JSLQuVJ+XsDIrQ+OWibw1VRqP1CyNbvLjWBKI5teKRCjvl9KUf+5LJBDl6hFDpHbHly849Zb3L5t+q5UuvsmltEciw7D8lHYjm2G2xi0t9VZtv7PHWDjWx1p2RbB3zrhWgfX/KJgVh2F2UQ9XLloZNXnFtmB9U1Wauzh8142Xyy8aF5pbtmms819l18zpMNn5T8bSnmd9j8nDK4zuc6TqabSaZY7xiMcCj/Xmz5PxfoectzXtn/bRDnt623qr9lK/59WVkfF9u4/L1a2XftJeX6nBvKJ9f4VMj5+zDfXMv1DpAPz5xyxeIV4qdcPrTtmzsudCSznc6uPjlTVb765m9sfj72IkQvs+89WV+fvNDx0smv0tWFd0hd9iVXfiFyVTVWN2eIn6qWxWZOm2spyDcPZPPEtE3supurboeSa92W9bPlkwpV8ExZj6vm7ypD6NypZQ2dJxf/UD65/JU6l3zupczn/wE=","base64"));

            // table 3a
            function mapClass(c) {
              switch (c) {
                case ALetter$1:
                case Hebrew_Letter$1:
                  return AHLetter$1;

                case MidNumLet$1:
                case Single_Quote$1:
                  return MidNumLetQ$1;

                default:
                  return c;
              }
            }

            class WordBreaker {
              constructor(charProvider) {
                this.charProvider = charProvider;
                this.pos = 0;
                this.nextClass = null;
                this.riCount = 0;
              }

              nextCodePoint() {
                const code = this.charProvider.charCodeAtPos();
                this.pos++;
                this.charProvider.advancePos();
                const next = this.charProvider.charCodeAtPos();

                // If a surrogate pair
                if ((0xd800 <= code && code <= 0xdbff) && (0xdc00 <= next && next <= 0xdfff)) {
                  this.pos++;
                  this.charProvider.advancePos();
                  return ((code - 0xd800) * 0x400) + (next - 0xdc00) + 0x10000;
                }

                return code;
              }

              nextCharClass() {
                return classTrie.get(this.nextCodePoint());
              }

              nextBreak() {
                while (this.charProvider.moreChar()) {
                  let lastClass, curClass, nextClass;

                  this.lastPos = this.pos;
                  this.curClass = this.nextClass;
                  if (!this.inSeq) {
                    this.last4Class = this.cur4Class;
                    this.cur4Class = this.nextClass;
                  }
                  this.nextClass = this.nextCharClass();

                  this.inSeq = false;

                  if (this.curClass == null) {
                    //return 0; // WB1
                    continue
                  }

                  curClass = this.curClass;
                  nextClass = this.nextClass;

                  // WB3
                  if (curClass === CR$1 && nextClass === LF$1) continue;

                  // WB3a
                  if (curClass === Newline$1 || curClass === CR$1 || curClass == LF$1){
                    return {pos: this.lastPos, type: curClass};
                  }


                  // WB3b
                  if (nextClass === Newline$1 || nextClass === CR$1 || nextClass == LF$1){
                    return {pos: this.lastPos, type: curClass};
                  }


                  // WB3c
                  if (curClass === ZWJ$1 && nextClass === Extended_Pictographic$1) continue;

                  // WB3d
                  if (curClass === WSegSpace$1 && nextClass === WSegSpace$1) continue;

                  // WB4
                  if (nextClass === Extend$1 || nextClass === Format$1 || nextClass === ZWJ$1) {
                    this.inSeq = true;
                    continue;
                  }

                  lastClass = this.last4Class;
                  curClass = this.cur4Class;

                  const mcurClass = mapClass(curClass);
                  const mnextClass = mapClass(nextClass);

                  // WB5
                  if (mcurClass === AHLetter$1 && mnextClass === AHLetter$1) continue;

                  let peekNext;
                  const restorePos = this.pos;
                  this.charProvider.posSave();
                  do peekNext = this.nextCharClass();
                  while (peekNext === Extend$1 || peekNext === Format$1 || peekNext === ZWJ$1);
                  this.pos = restorePos;
                  this.charProvider.posRestore();

                  const mpeekNext = mapClass(peekNext);
                  const mlastClass = mapClass(lastClass);

                  if (curClass === Regional_Indicator$1) {
                    this.riCount += 1;
                  } else {
                    this.riCount = 0;
                  }

                  // WB6
                  if (mcurClass === AHLetter$1 && (nextClass === MidLetter$1 || mnextClass === MidNumLetQ$1) && mpeekNext === AHLetter$1) continue;
                  
                  // WB7
                  if (mlastClass === AHLetter$1 && (curClass === MidLetter$1 || mcurClass === MidNumLetQ$1) && mnextClass === AHLetter$1) continue;

                  // WB7a
                  if (curClass === Hebrew_Letter$1 && nextClass === Single_Quote$1) continue;

                  // WB7b
                  if (curClass === Hebrew_Letter$1 && nextClass === Double_Quote$1 && peekNext === Hebrew_Letter$1) continue;

                  // WB7c
                  if (lastClass === Hebrew_Letter$1 && curClass === Double_Quote$1 && nextClass === Hebrew_Letter$1) continue;

                  // WB8
                  if (curClass === Numeric$1 && nextClass === Numeric$1) continue;

                  // WB9
                  if (mcurClass === AHLetter$1 && nextClass === Numeric$1) continue;

                  // WB10
                  if (curClass === Numeric$1 && mnextClass === AHLetter$1) continue;

                  // WB11
                  if (lastClass === Numeric$1 && (curClass === MidNum$1 || mcurClass === MidNumLetQ$1) && nextClass === Numeric$1) continue;

                  // WB12
                  if (curClass === Numeric$1 && (nextClass === MidNum$1 || mnextClass === MidNumLetQ$1) && peekNext === Numeric$1) continue;

                  // WB13
                  if (curClass === Katakana$1 && nextClass === Katakana$1) continue;

                  // WB13a
                  if ((mcurClass === AHLetter$1 || curClass ===  Numeric$1 || curClass === Katakana$1 || curClass === ExtendNumLet$1) && nextClass === ExtendNumLet$1) continue;

                  // WB13b
                  if (curClass === ExtendNumLet$1 && (mnextClass === AHLetter$1 || nextClass === Numeric$1 || nextClass === Katakana$1)) continue;

                  // WB15, WB16
                  if (curClass === Regional_Indicator$1 && nextClass === Regional_Indicator$1) {
                    if (this.riCount % 2 === 1) continue;
                  }

                  // WB999
                  return {pos: this.lastPos, type: curClass};
                }

                if (this.pos && !this.end) {
                  this.end = true;
                  return {pos: Infinity, type: this.curClass};// WB2
                }

                return null;
              }
            }
            var src = {classes, WordBreaker};
            var src_1 = src.classes;
            var src_2 = src.WordBreaker;

            class OffscreenCanvasCreator {
                canvas = null;
                context = null;
                getOrCreateCanvas(offscreenCanvas, contextAttributes ) {
                    if (this.canvas) {
                        return this.canvas;
                    }
                    if (offscreenCanvas) {
                        this.canvas = offscreenCanvas;
                        this.context = this.canvas.getContext('2d', contextAttributes);
                    } else {
                        try {
                            // OffscreenCanvas2D measureText can be up to 40% faster.
                            this.canvas = new window.OffscreenCanvas(0, 0);
                            this.context = this.canvas.getContext('2d', contextAttributes);
                            if (!this.context || !this.context.measureText) {
                                this.canvas = document.createElement('canvas');
                                this.context = this.canvas.getContext('2d', contextAttributes);
                            }
                        } catch (ex) {
                            this.canvas = document.createElement('canvas');
                            this.context = this.canvas.getContext('2d', contextAttributes);
                        }
                    }

                    this.canvas.width = 10;
                    this.canvas.height = 10;
                    //this.context.fontKerning = "none";
                    //this.context.textRendering = "optimizeLegibility";
                    return this.canvas;
                }

                getOrCreateContext(offscreenCanvas, contextAttributes ) {
                    if (this.context) {
                        return this.context;
                    }
                    this.getOrCreateCanvas(offscreenCanvas, contextAttributes);
                    return this.context;
                }
            }

            const offscreenCanvasCreator = new OffscreenCanvasCreator();

            const defaultFontStyle = {
                fontSize: 10,// pt
                fontFamily: 'Cambria',
                fontWeight: 'normal',
                fontVariant: 'normal',
                fontStyle: 'normal',
                fontString: '10pt Cambria'
            };

            function toFontString(attributes) {
                const { fontSize, fontFamily, fontStyle, fontVariant, fontWeight } =
                    attributes;
                const fontSizeString = `${fontSize}pt`;
                return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSizeString} ${fontFamily}`;
            }

            class TextMetrics {

                measureText(text, style) {
                    const { fontSize, fontString: font } = style;
                    const context = offscreenCanvasCreator.getOrCreateContext();
                    context.font = font;
                    //context.fontStretch = "ultra-condensed";
                    //context.letterSpacing = `${-0.05*fontSize}pt`;
                    const m = context.measureText(text);
                    let ascent, descent;
                    if (m.fontBoundingBoxAscent) {
                        ascent = m.fontBoundingBoxAscent;
                        descent = m.fontBoundingBoxDescent;
                    } else {
                        let h = fontSize * 4/3;
                        ascent = m.actualBoundingBoxAscent;
                        descent = m.actualBoundingBoxDescent;
                        let as = (h - ascent - descent) * 0.9;
                        let ds = (h - ascent - descent) * 0.1;
                        ascent += as;
                        descent += ds;
                        //console.log(m, font, text, as, ds);
                    }
                    let height = ascent + descent;
                    let width = m.width;
                    return {font, width, height, ascent, descent };
                }
            }

            const textMetrics = new TextMetrics();

            const MULTIPLE = 5;

            class IndentSpacingConv {
                constructor(textIndent = 0,
                            marginLeft = 0, marginRight = 0,
                            marginTop = 0, marginBottom = 0) {
                    this.textIndent = textIndent;
                    this.marginLeft = marginLeft;
                    this.marginRight = marginRight;
                    this.marginTop = marginTop;
                    this.marginBottom = marginBottom;
                }
                static fromPr(pr, conv) {
                    if(pr.first_line_indent)
                        conv.textIndent = pr.first_line_indent.px;
                    if(pr.ind_left)
                        conv.marginLeft = pr.ind_left.px;
                    if(pr.ind_right)
                        conv.marginRight = pr.ind_right.px;
                    if(pr.spacing_before)
                        conv.marginTop =  pr.spacing_before.px;
                    if(pr.spacing_after)
                        conv.marginBottom = pr.spacing_after.px;
                }
            }

            class LineSpacingConv {
                constructor(spacing=0, type="asIs") {
                    this.spacing = spacing;
                    this.type = type;
                }
                static fromPr(pr, conv) {
                    let lsc = conv.lineSpacing = new this();
                    let {spacing_line, spacing_lineRule} = pr;
                    if (spacing_line === null) {
                        return ;
                    }
                    if (spacing_lineRule === MULTIPLE) {
                        lsc.spacing = (spacing_line.pt / 12);
                        lsc.type = 'multiple';
                    } else {
                        lsc.spacing = spacing_line.px;
                        lsc.type = 'px';
                    }
                   // return lsc;
                }
                getLineHeight(lineHeight) {
                    let height, advance;
                    if(this.type === 'multiple') {
                        height = lineHeight * this.spacing;
                        advance = lineHeight + (height - lineHeight)/2;
                    } else if(this.type === 'px'){
                        height = this.spacing;
                        advance = lineHeight + (height - lineHeight)/2;
                    } else {
                        height = lineHeight;
                        advance = lineHeight;
                    }
                    return {height, advance};
                }
            }
            class ShdConv {
                constructor() {
                    this.backgroundColor = null;
                }
                static fromPr(pr, conv) {
                    let {shd} = pr;
                    if(shd){
                        let color = shd.fill;
                        if(color!='auto')
                            conv.backgroundColor = `#${color}`;
                    }
                }
            }
            class AlignmentConv {
                constructor() {
                    this.textAlign = "left";
                }
                static fromPr(pr, conv) {
                    let {jc_val} = pr;
                    if(jc_val){
                        let alignment = "left";
                        switch (jc_val){
                            case 0:
                                alignment = "left";
                                break;
                            case 1:
                                alignment = "center";
                                break;
                            case 2:
                                alignment = "right";
                                break;
                            case 3:
                                alignment = "justify";
                                break;
                        }
                        conv.textAlign = alignment;
                    }
                }
            }

            class LineConv{
                static from(val){
                    switch (val) {
                        case "dash":
                        case "dashDotDotHeavy":
                        case "dashDotHeavy":
                        case "dashedHeavy":
                        case "dashLong":
                        case "dashLongHeavy":
                        case "dotDash":
                        case "dotDotDash":
                            return "dashed";
                        case "dotted":
                        case "dottedHeavy":
                            return "dotted";
                        case "double":
                            return "double";
                        case "single":
                        case "thick":
                        case "words":
                            return "solid";
                        case "nil":
                            return "none";
                    }
                    return "solid";
                }
            }
            let sides = ['left', 'right', 'top', 'bottom'];

            class BorderConv {
                constructor(side, style=null, width=0,
                            color='#000000', padding=0) {
                    this.side = side;
                    this.style = style;
                    this.width = width;
                    this.color = color;
                    this.padding = padding;
                }
                from(prBorder) {
                    let {val} = prBorder;
                    if (val === "nil")
                        return;
                    this.style = LineConv.from(val);
                    let {sz, color, space} = prBorder;
                    if(sz) {
                        this.width = sz * 0.125 * 4/3;
                    }
                    if(color) {
                        if(color !== "auto")
                            this.color = `#${color}`;
                    }
                    if(space) {
                        this.padding = space * 4/3;
                    }
                }
            }
            class BordersConv {
                constructor(init=false) {
                    if(init) {
                        this.left = new BorderConv('left');
                        this.right = new BorderConv('right');
                        this.top = new BorderConv('top');
                        this.bottom = new BorderConv('bottom');
                    }
                }
                static fromPr(prBorders, conv) {
                    for(let side of sides) {
                        let border = prBorders[side];
                        if(!border) continue;
                        let convBorder = conv[side] = new BorderConv(side);
                        //if(!convBorder) {
                        //    convBorder = new BorderConv(side);
                        //    conv[side] = convBorder;
                        //}
                        convBorder.from(border);
                    }
                }
            }

            class ParaBordersConv extends BordersConv {
                static getPrBorders(pr) {
                    return pr.pBdr;
                }
                static fromPr(pr, conv) {
                    let borders = this.getPrBorders(pr);
                    if (!borders) return;
                    super.fromPr(borders, conv);
                }
            }

            class PrConv {
                static attrConvs = [];
                static prToConv(pr){
                    let conv = {};
                    for(let attrConv of this.attrConvs) {
                        attrConv.fromPr(pr, conv);
                    }
                    return conv;
                }
                static toStyleObj(conv, styleObj){
                    if(!styleObj)
                        styleObj = {};
                    for(let attrConv of this.attrConvs) {
                        attrConv.toStyleObj(conv, styleObj);
                    }
                    return styleObj;
                }
                static getStyleObj(pr, styleObj) {
                    let conv = this.prToConv(pr);
                    return this.toStyleObj(conv, styleObj);
                }
            }


            class PPrConv extends PrConv {
                static attrConvs = [IndentSpacingConv, AlignmentConv, LineSpacingConv,
                    ShdConv, ParaBordersConv];
                static getStylePr(style) {
                    return style._element.pPr;
                }
            }

            function fontCheck(testFont) {
                //from https://github.com/rwoodr/fontcheck
                let baseFonts = ['serif', 'sans-serif', 'monospace'];
                // Text to use for all measurments
                let testString = 'abcdefghijklmnopqrstuvwxyz& #0123456789';
                // Font size for all measurments
                let fontSize = '32px';
                // Canvas context
                let context = offscreenCanvasCreator.getOrCreateContext();

                // Return result of comparing test font to base fonts
                return baseFonts.some(baseFont => {
                    // Measure base font
                    context.font = fontSize + ' ' + baseFont;
                    let baseFontWidth = context.measureText(testString).width;

                    // Measure test font, include base font fallback
                    context.font = fontSize + ' ' + testFont + ',' + baseFont;
                    let testFontWidth = context.measureText(testString).width;

                    // Return true immediately if the widths are different (font available)
                    // Or return false after all base fonts checked (font not available)
                    return (baseFontWidth !== testFontWidth);
                });
            }

            class FontChecker {
                constructor() {
                    this.toBeChecked = [];
                    this.checked = new Map();
                }
                addTbc(fontName) {
                    let c = this.checked.get(fontName);
                    if(!c && !this.toBeChecked.includes(fontName)) {
                        this.toBeChecked.push(fontName);
                    }
                }
                check() {
                    for(let fontName of this.toBeChecked) {
                        if(fontCheck(fontName)) {
                            //console.log("font available", fontName);
                            this.checked.set(fontName, true);
                        } else {
                            console.log("font not available", fontName);
                            this.checked.set(fontName, false);
                        }
                    }
                    this.toBeChecked.length = 0;
                }
            }

            const fontChecker = new FontChecker();

            //import {RunBorderConv} from "./prAttrConvs";

            const ST_HexColorAuto = 'auto';
            const boolAttrs = ['b', 'i', 'caps', 'smallCaps'];//, 'rtl', 'strike', 'outline'
            const boolAttrs2 = ['subscript', 'superscript'];


            function parseRFonts(rFonts, theme, conv) {
                if(!rFonts) return;
                let {ascii, hAnsi, eastAsia, cs, asciiTheme,
                    hAnsiTheme, eastAsiaTheme, csTheme, hint } = rFonts;
                if(asciiTheme) {
                    //console.log(asciiTheme, 'asciiTheme');//,
                    let m = asciiTheme.slice(0,5) + 'Font';
                    conv.ascii = theme[m].ascii;
                    fontChecker.addTbc(conv.ascii);
                }
                if(ascii) {
                    //console.log(ascii, 'ascii');
                    conv.ascii = ascii;
                    fontChecker.addTbc(conv.ascii);
                }
                if(eastAsiaTheme) {
                    //console.log(eastAsiaTheme, 'eastAsiaTheme');
                    let m = eastAsiaTheme.slice(0,5) + 'Font';
                    conv.ea = theme[m].ea;
                    fontChecker.addTbc(conv.ea);
                }
                if(eastAsia) {
                    //console.log(eastAsia, 'eastAsia');
                    conv.ea = eastAsia;
                    fontChecker.addTbc(conv.ea);
                }
                if(csTheme) {
                    //console.log(csTheme, 'csTheme');
                    let m = csTheme.slice(0,5) + 'Font';
                    conv.cs = theme[m].cs;
                    fontChecker.addTbc(conv.cs);
                }
                if(cs) {
                    //console.log(cs, 'cs');
                    conv.cs = cs;
                    fontChecker.addTbc(conv.cs);
                }
                if(hint) {
                    //console.log(hint, 'hint')
                    if(hint==='eastAsia') {
                        conv.ea = theme['majorFont'].ea;
                        fontChecker.addTbc(conv.ea);
                    }
                } //else
                //console.log(ascii, hAnsi, eastAsia, cs, asciiTheme,
                //    hAnsiTheme, eastAsiaTheme, csTheme, hint);
                return conv;

            }
            function fixFont(font) {
                if(font.includes(';')) {
                    let a = font.split(';');
                    let b = [];
                    for(let p of a) {
                        b.push(`"${p}"`);
                    }
                    //console.log(b.join(', '), font, 'fixFont')
                    return b.join(', ');
                }
                return font;
            }

            function joinFontName(fontObj) {
                let {ascii, ea, cs} = fontObj;
                let a = [];
                if(ascii) {
                    a.push(fixFont(ascii));
                }
                if(ea) {
                    a.push(fixFont(ea));
                }
                if(cs) {
                    //console.log(cs);
                    a.push(fixFont(cs));
                }
                return a.join(',');
            }

            class RPrConv extends PrConv {
                static getStylePr(style) {
                    return style._element.rPr;
                }
                static prToConv(pr, theme) {
                    let conv = {};
                    for(let attr of boolAttrs){
                        let v = pr._get_bool_val(attr);
                        if(v!==null) {
                            conv[attr] = v;
                        }
                    }
                    for(let attr of boolAttrs2){
                        let v = pr[attr];
                        if(v!==null) {
                            conv[attr] = v;
                        }
                    }
                    let {sz_val, color, u_val} = pr;//, highlight_val, u_val
                    if(sz_val)
                        conv.fontSize = sz_val.pt;

                    if(color){
                        if (color.val != ST_HexColorAuto) {
                            conv.fontColor = color.val;
                        }
                    }
                    //if(highlight_val){
                        //console.log(highlight_val, 'highlight')
                        //conv.highlight = enums.WD_COLOR.to_xml(highlight_val);
                    //}
                    if(u_val)
                        conv.underline = u_val;
                    //RunBorderConv.from(pr, conv);
                    let {rFonts} = pr;
                    if (rFonts)
                        parseRFonts(rFonts, theme, conv);
                    return conv;
                }
                static toStyleObj(conv, obj){
                    if(!obj)
                        obj = {};
                    if (conv.b) {
                        obj.fontWeight = 'bold';
                    }
                    if (conv.i) {
                        obj.fontStyle = 'italic';
                    }
                    if (conv.underline) {
                        obj.textDecoration = 'underline';
                    }
                    //if (conv.rtl) {
                    //    obj.direction = 'rtl';
                    //}
                    if(conv.caps) {
                        obj.fontVariant = 'all-small-caps';
                    }
                    if(conv.smallCaps) {
                        obj.fontVariant = 'small-caps';
                    }
                    //if (conv.outline) {
                    //    obj.outline = 'auto';
                   // }
                    if (conv.fontColor) {
                        obj.fill = `#${conv.fontColor}`;
                    }
                    if (conv.fontSize) {
                        obj.fontSize = conv.fontSize;
                    }
                    //if (conv.highlight) {
                    //    obj.backgroundColor = conv.highlight;
                    //}
                    //if(conv.fontName) {
                        obj.fontFamily = joinFontName(conv);
                    //}
                    //RunBorderConv.toStyleObj(conv, obj);
                    return obj;
                }
            }

            class RunFont {
                constructor(run, para, styleMap) {
                    this.run = run;
                    this.para = para;
                    this.styleMap = styleMap;
                }
                get fontFromStyleMap() {
                    if(!this.run || !this.run._element) {
                        return;
                    }
                    let styleId = this.run._element.style;
                    if(styleId) {
                        return this.styleMap.idToFont(styleId).conv;
                    }
                }
                get fontFromPara() {
                    return this.para.font;
                }
                get fontFromRun() {
                    if(!this.run || !this.run._element) {
                        return;
                    }
                    let rpr = RPrConv.getStylePr(this.run);
                    if (rpr)
                        return RPrConv.prToConv(rpr, this.styleMap.theme);
                }
                get font() {
                    if(this._font) return this._font;
                    let conv = {...this.styleMap.defaultFont, ...this.fontFromStyleMap,
                        ...this.fontFromPara, ...this.fontFromRun};
                    let obj = RPrConv.toStyleObj(conv);
                    let _font = {...defaultFontStyle, ...obj};
                    _font.fontString = toFontString(_font);
                    this._font = _font;
                    return this._font;
                }
            }

            class RunWrapper {
                constructor(run, options) {
                    this._run = run;
                    this.text = run.text;
                    this.para = options.para;
                    this.styleMap = options.styleMap;
                }
                get length() {
                    return this.text.length;
                }
                charCodeAt(index){
                    return this.text.charCodeAt(index);
                }

                get font() {
                    if(!this._font)
                        this._font = new RunFont(this._run, this.para, this.styleMap).font;
                    return this._font;
                }
            }

            class DefaultRun {
                constructor(para) {
                    this.para = para;
                }
                get font() {
                    return defaultFontStyle;
                }
            }

            class Word {

                constructor(type) {
                    this.type = type;
                    this.parts = [];
                }

                toString() {
                    return this.text;
                }
                isSpace() {
                    return this.type === src_1.WSegSpace;
                }
                isTab() {
                    return false;
                }
                isNewline() {
                    return this.type === src_1.Newline ||
                        this.type === src_1.CR ||
                        this.type === src_1.LF;
                }

                addPart(text, run) {
                    let part = new Part(text, run);
                    this.parts.push(part);
                }

                get text() {
                    let a = [];
                    for(let part of this.parts) {
                        a.push(part.text);
                    }
                    return a.join('');

                }
                get width() {
                    let w = 0;
                    for(let part of this.parts) {
                        w += part.width;
                    }
                    return w;
                }
                get height() {
                    if(this._height) return this._height;
                    let h = 0;
                    for(let part of this.parts) {
                        h = Math.max(h, part.height);
                    }
                    this._height = h;
                    return this._height;
                }
                get descent() {
                    if(this._descent) return this._descent;
                    let h = 0;
                    for(let part of this.parts) {
                        h = Math.max(h, part.descent);
                    }
                    this._descent = h;
                    return this._descent;
                }
                wrap(width) {
                    let availableWidth = width;
                    for(let i = 0; i < this.parts.length; i++) {
                        let part = this.parts[i];
                        if(part.width < availableWidth) {
                            availableWidth -= part.width;
                        } else if(part.width === availableWidth) {
                            return this.split(i + 1);
                        } else {
                            let [p0, p1] = part.wrap(availableWidth);
                            if(p0) {
                                return this.split2(i, p0, p1);
                            } else {
                                return this.split(i);
                            }
                        }
                    }
                }
                split(i) {
                    let ps0 = this.parts.slice(0, i);
                    let w0 = new SubWord(this.type);
                    w0.parts = ps0;
                    let ps1 = this.parts.slice(i);
                    let w1 = new SubWord(this.type);
                    w1.parts = ps1;
                    return [w0, w1];
                }
                split2(i, p0, p1) {
                    let ps0 = this.parts.slice(0, i);
                    let w0 = new SubWord(this.type);
                    w0.parts = ps0;
                    w0.parts.push(p0);
                    let ps1 = this.parts.slice(i + 1);
                    let w1 = new SubWord(this.type);
                    w1.parts = ps1;
                    w1.parts.unshift(p1);
                    return [w0, w1];
                }
            }
            class SubWord extends Word {
            }
            class Part {
                constructor(text, run) {
                    this._run = run;
                    this._text = text;
                    this._metrics = null;
                }
                get text() {
                    return this._text;
                }
                set text(_text) {
                    if(this._text!==_text) {
                        this._metrics = null;
                        this._text = _text;
                    }
                }
                getParts(refresh) {
                    if(!this.subParts) {
                        this.subParts = [];
                        this.subPartPool = [];
                    } else if(refresh) {
                        this.subParts.push(...this.subPartPool);
                        this.subPartPool = this.subParts;
                        this.subParts = [];
                    }
                    return [this.subPartPool, this.subParts];
                }

                getSubPart(text, part, refresh=false) {
                    let [subPartPool, subParts] = this.getParts(refresh);
                    let subPart;
                    if(subPartPool.length > 0){
                        subPart = subPartPool.shift();
                        subPart.text = text;
                    } else {
                        subPart = new SubPart(text, this._run, part);
                    }
                    subParts.push(subPart);
                    return subPart;
                }

                split(i) {
                    let p0 = this.getSubPart(this._text.slice(0, i), this, true);
                    let p1 = this.getSubPart(this._text.slice(i), this);
                    return [p0, p1];
                }

                get metrics() {
                    return this._metrics || (
                        this._metrics = textMetrics.measureText(this._text, this.fontStyle));
                }

                get width() {
                    return this.metrics.width;
                }
                get height() {
                    return this.metrics.height;
                }
                get descent() {
                    return this.metrics.descent;
                }
                get ascent() {
                    return this.metrics.ascent;
                }
                get fontStyle() {
                    return this._run.font;
                }

                wrap(width) {
                    for(let i = 1; i <= this._text.length; i++) {
                        let text = this._text.slice(0, i);
                        let m = textMetrics.measureText(text, this.fontStyle);
                        if( m.width > width){
                            if(i===1) {
                                return [null, this];
                            } else {
                                return this.split(i - 1);
                            }
                        } else if( m.width === width){
                            return this.split(i);
                        } else {
                            if(i === this._text.length)
                                console.log(text, m.width, width);
                        }
                    }
                }
            }

            class SubPart extends Part{
                constructor(text, run, part) {
                    super(text, run);
                    this.part = part;
                }
                getParts() {
                    return [this.part.subPartPool, this.part.subParts];
                }
                split(i) {
                    let p1 = this.getSubPart(this._text.slice(i), this.part);
                    this.text = this._text.slice(0, i);
                    return [this, p1];
                }
            }
            class EmptyPart extends Part{
                constructor(_run) {
                    super(' ', _run);
                }
                get width() {
                    return 0;
                }
            }
            class EmptyWord extends Word{
                constructor(_run) {
                    super('empty');
                    this.parts.push(new EmptyPart(_run));
                }
                isSpace() {
                    return true;
                }
            }
            class TabPart extends Part{
                constructor(_run) {
                    super('    ', _run);
                }
            }
            class TabWord extends Word{
                constructor(_run) {
                    super('tab');
                    this.parts.push(new TabPart(_run));
                }
                isTab() {
                    return true;
                }
            }
            class EndPart extends Part{
                constructor(_run) {
                    super(' ', _run);
                }
                get width() {
                    return 0;
                }
                get text() {
                    return '';
                }
            }
            class EndWord extends Word{
                constructor() {
                    super('end');
                    let _run = new DefaultRun();
                    this.parts.push(new EndPart(_run));
                }
                isSpace() {
                    return true;
                }
            }

            class Context {
                constructor() {
                    this.wordPos = 0;
                    this.preWord = null;
                    this.lineNo = 0;
                    this.firstWrapped = false;
                }
                save(src) {
                    this.wordPos = src.wordPos;
                    this.preWord = src.preWord;
                    this.lineNo = src.lineNo;
                    this.firstWrapped = src.firstWrapped;
                }
                restore(target) {
                    target.wordPos = this.wordPos;
                    target.preWord = this.preWord;
                    target.lineNo = this.lineNo;
                    target.firstWrapped = this.firstWrapped;
                }
            }
            class LineWidths {
                constructor(width) {
                    this.widths = new Map();
                    if(width)
                        this.setFirstWidth(width);
                }
                setFirstWidth(width) {
                    this.setWidth(0, width);
                }
                setWidth(index, width) {
                    this.widths.set(index, width);
                }
                getWidth(index) {
                    for(let i = index; i >= 0; i--) {
                        let width = this.widths.get(i);
                        if(width) return width;
                    }
                }
            }


            class LineLoader {
                constructor(words, width) {
                    this.init(words, width);
                }

                init(words, width) {
                    this.lineNo = 0;
                    this.wordPos = 0;
                    this.preWord = null;
                    this.firstWrapped = false;
                    this.contexts = new Map();
                    this.words = words;
                    this.lineWidths = new LineWidths(width);
                }

                saveLineContext(lineNo=null) {
                    let no = lineNo || this.lineNo;
                    let context = this.contexts.get(no) || new Context();
                    context.save(this);
                    this.contexts.set(no, context);
                }
                getLineContext(lineNo=null) {
                    let no = lineNo || this.lineNo;
                    console.log(this.contexts);
                    let context = this.contexts.get(no);
                    console.log(context);
                    return this.contexts.get(no);
                }
                backward(nextWidth) {
                    this.lineWidths.setWidth(this.lineNo - 1, nextWidth);
                    let context = this.getLineContext(this.lineNo - 1);
                    if(context.preWord && context.firstWrapped) {
                        context = this.getLineContext(this.lineNo - 2);
                        context.restore(this);
                        return 1;
                    } else {
                        context.restore(this);
                        return 0;
                    }
                }
                nextLine() {
                    this.saveLineContext();
                    let line = new Line$1();
                    let word;
                    let availableWidth = this.lineWidths.getWidth(this.lineNo);
                    if(this.preWord) {
                        word = this.preWord;
                        this.firstWrapped = false;
                        this.preWord = null;
                    } else {
                        word = this.words.item(this.wordPos++);
                    }

                    while(word) {
                        if(word.parts.length === 0) {
                            console.log('empty parts');
                            word = this.words.item(this.wordPos++);
                            continue;
                        }
                        if(word.isSpace() || word.isTab()) {
                            line.addWord(word);
                            availableWidth -= word.width;
                            word = this.words.item(this.wordPos++);
                            continue;
                        }
                        if(word.isNewline()) {
                            line.addWord(word);
                            this.lineNo++;
                            return line;
                        }
                        if(availableWidth < 0) {
                            this.wordPos--;
                            this.lineNo++;
                            return line;
                        }

                        if(word.width <= availableWidth) {
                            line.addWord(word);
                            availableWidth -= word.width;
                            word = this.words.item(this.wordPos++);
                            continue;
                        } else {
                            let nextWidth = this.lineWidths.getWidth(this.lineNo + 1);
                            if(word.width <= nextWidth) {
                                this.wordPos--;
                                this.lineNo++;
                                return line;
                            } else {
                                let [w0, w1] = word.wrap(availableWidth);
                                if(w0) {
                                    line.addWord(w0);
                                    this.preWord = w1;
                                    if(word instanceof Word) {
                                        this.firstWrapped = true;
                                    }
                                } else {
                                    this.wordPos--;
                                }
                                this.lineNo++;
                                return line;
                            }
                        }
                    }

                    if(line.notEmpty){
                        this.lineNo++;
                        return line;
                    } else {
                        if(this.lineNo===0)
                            console.log('empty para', this.lineNo);
                    }
                }
            }

            class WordStore {
                constructor() {
                    this.words = [];
                    this.currentWord = null;
                }
                addPart(text, run, type) {
                    if(text==='\t') return this.addTab(run);
                    if(!this.currentWord)
                        this.currentWord = new Word(type);
                    this.currentWord.addPart(text, run);
                }
                addTab(run) {
                    if(this.currentWord) {
                        this.words.push(this.currentWord);
                        this.currentWord = null;
                    }
                    let word = new TabWord(run);
                    this.words.push(word);
                }
                addEmptyPart(run) {
                    if(this.currentWord) {
                        this.words.push(this.currentWord);
                        this.currentWord = null;
                    }
                    let word = new EmptyWord(run);
                    this.words.push(word);
                }
                finish() {
                    if(this.currentWord) {
                        this.words.push(this.currentWord);
                        this.currentWord = null;
                    }
                    let words = this.words;
                    this.words = [];
                    return words;
                }
            }
            class CharProvider {

                //constructor(runs) {
                //    this.init(runs);
                //}
                init(runs) {
                    this.runs = runs;
                    this.pos = 0;
                    this.runPos = 0;
                    let {run, index} = this.firstCharRun(0);
                    if(!run) {
                        if(index==0) {
                            this.runsType = 'noRuns';
                        }
                        else {
                            this.runsType = 'noChars';
                        }
                    }
                    this.runIndex = index;
                    this.run = run;

                    this.lastBreakPos = 0;
                    this.lastBreakRunPos = 0;
                    this.lastBreakRunIndex = 0;
                }
                advancePos() {
                    if(!this.run) {
                        //peek;
                        //console.log(this.pos, this.runPos);
                        return;
                    }
                    this.pos++;
                    this.runPos++;
                    if(this.runPos >= this.run.length){
                        let {run, index} = this.firstCharRun(this.runIndex + 1);
                        this.runIndex = index;
                        this.run = run;
                        this.runPos = 0;
                    }
                }
                charCodeAtPos() {
                    if(this.run)
                        return this.run.charCodeAt(this.runPos);
                }

                firstCharRun(start) {
                    let index = start;
                    let run = this.runItem(index);
                    while(run && run.length === 0) {
                        run = this.runItem(++index);
                    }
                    return {run, index};
                }
                runItem(index) {
                    return this.runs.item(index);
                }

                moreChar() {
                    if(!this.run) return false;
                    if (this.runPos >= this.run.length) {
                        let {run} = this.firstCharRun(this.runIndex + 1);
                        if (!run) return false;
                    }
                    return true;
                }

                posSave() {
                    this.peekPos = this.pos;
                    this.peekRunPos = this.runPos;
                    this.peekRunIndex = this.runIndex;
                    this.peekRun = this.run;
                }
                posRestore() {
                    this.pos = this.peekPos;
                    this.runPos = this.peekRunPos;
                    this.runIndex = this.peekRunIndex;
                    this.run = this.peekRun;
                }
                breakRun(pos, type, words) {
                    let lastBreakRun = this.runItem(this.lastBreakRunIndex);
                    if (!lastBreakRun) {
                        if(isFinite(pos))
                            console.log('no lastBreakRun!', pos, this.lastBreakPos);
                        return;
                    }
                    let text = lastBreakRun.text;
                    if (text.length === 0) {
                        words.addEmptyPart(lastBreakRun);
                        this.lastBreakRunPos = 0;
                        this.lastBreakRunIndex++;
                        this.breakRun(pos, type, words);
                    } else {
                        let breakLen = pos - this.lastBreakPos;
                        let runLeft = lastBreakRun.length - this.lastBreakRunPos;
                        let partText = text.substr(this.lastBreakRunPos, breakLen);
                        words.addPart(partText, lastBreakRun, type);
                        if (breakLen >= runLeft) {
                            this.lastBreakRunPos = 0;
                            this.lastBreakPos += runLeft;
                            this.lastBreakRunIndex++;
                            if (breakLen > runLeft) {
                                this.breakRun(pos, type, words);
                            }
                        } else {
                            this.lastBreakRunPos += breakLen;
                            this.lastBreakPos = pos;
                        }
                    }
                }

                makeIterator(runs) {
                    function *iter(charProvider) {
                        let wordBreaker = new src_2(charProvider);
                        let _wb = wordBreaker.nextBreak();
                        let wordStore = new WordStore();
                        while(_wb) {
                            let {pos, type} = _wb;
                            //console.log(pos, type);
                            charProvider.breakRun(pos, type, wordStore);
                            let words = wordStore.finish();
                            //if(words.length > 1) {
                            //    console.log('empty words', words);
                            //}
                            for(let word of words)
                                yield word;
                            _wb = wordBreaker.nextBreak();
                        }
                    }
                    function *noCharsIter() {
                        for(let run of runs) {
                            let word = new EmptyWord(run);
                            yield word;
                        }
                    }
                    function *noRunsIter() {
                        let word = new EndWord();
                        yield word;
                    }

                    this.init(runs);
                    if(this.runsType==="noChars") {
                        return noCharsIter();
                    } else if( this.runsType==="noRuns") {
                        return noRunsIter();
                    } else {
                        return iter(this);
                    }
                }
            }

            class RunLoader extends IterLoader {

                setIter(options) {
                    let {para, runs} = options;
                    this.iter = runs;
                    this.para = para;
                }
                load(index) {
                    let count = Math.max(index + 1 - this.items.length, this.step);
                    while (count > 0) {
                        let {value, done} = this.iter.next();
                        if(!done) {
                            if(value.runs) {
                                for(let run of value.runs) {
                                    let v = this.pack(run);
                                    if(v) {
                                        this.items.push(v);
                                        count--;
                                    }
                                }

                            } else {
                                let v = this.pack(value);
                                if(v) {
                                    this.items.push(v);
                                    count--;
                                }
                            }

                        } else {
                            if(this.items.length === 0) ;
                            this.done = true;
                            break;
                        }
                    }
                }
                pack(value) {
                    return new RunWrapper(value, this.options);
                }
            }

            class RunArray {

                constructor(children) {
                    this.list = [];
                    for(let child of children) {
                        let run = new RunWrapper(child);
                        this.list.push(run);
                    }
                }
                item(index) {
                    return this.list[index];
                }
            }

            class WordLoader extends IterLoader {
                constructor(options) {
                    super(options);
                    this.step = 10;
                }
                setIter(options) {
                    let {runs} = options;
                    this.charProvider = new CharProvider();
                    if(runs instanceof RunArray) ; else {
                        runs = new RunLoader(options);
                    }
                    this.iter = this.charProvider.makeIterator(runs);
                }
            }

            class ParaFont {
                constructor(para, styleMap) {
                    this.para = para;
                    this.styleMap = styleMap;
                }
                get fontFromStyleMap() {
                    let styleId = this.para._element.style;
                    if(!styleId) {
                        styleId = "Normal";
                    }
                    let format = this.styleMap.idToFormat(styleId) ;
                    if(format){
                        return format.font;
                    }
                }
                get fontFromRpr() {
                    let ppr = PPrConv.getStylePr(this.para);
                    if(ppr) {
                        let {rPr} = ppr;
                        if (rPr) {
                            return RPrConv.prToConv(rPr, this.styleMap.theme);
                        }
                    }
                }
                get font() {
                    if(!this._font)
                        this._font = {...this.fontFromStyleMap, ...this.fontFromRpr};
                    return this._font;
                }
            }

            class ParaFormat {
                constructor(para, styleMap) {
                    this.para = para;
                    this.styleMap = styleMap;
                }
                get formatFromStyleMap(){
                    let styleId = this.para._element.style;
                    if(!styleId) {
                        styleId = "Normal";
                    }
                    let format = this.styleMap.idToFormat(styleId) ;
                    if(format){
                        return format.conv;
                    }
                }
                get formatFromPpr(){
                    let ppr = PPrConv.getStylePr(this.para);
                    if(ppr) {
                        return PPrConv.prToConv(ppr);
                    }
                }
                get format() {
                    if(!this._format)
                        this._format = {...this.styleMap.defaultFormat,
                            ...this.formatFromStyleMap, ...this.formatFromPpr};
                    return this._format;
                }
                getBorders(aBox) {
                    let {left, right, top, bottom, backgroundColor} = this.format;
                    let borderBox = this.paraBox.getBorderBox(aBox);
                    return {left, right, top, bottom, backgroundColor, borderBox};
                }
                getBoxHeight(contentHeight) {
                    return this.paraBox.getBoxHeight(contentHeight);
                }
                getContentWidth(width) {
                    return this.paraBox.getContentWidth(width);
                }
                getContentHeight(height) {
                    return this.paraBox.getContentHeight(height);
                }
                getOffsetX(x) {
                    return this.paraBox.getOffsetX(x);
                }
                getOffsetY(y) {
                    return this.paraBox.getOffsetY(y);
                }
                getLineHeight(height) {
                    return this.format.lineSpacing.getLineHeight(height);
                }
                get paraBox() {
                    if(!this._paraBox)
                        this._paraBox = new ParaBox(this.format);
                    return this._paraBox;
                }
            }


            function cap(side) {
                return side.charAt(0).toUpperCase() + side.slice(1,);
            }

            class BoxSide {
                constructor(side, format) {
                    let Side = cap(side);
                    let margin = format['margin'+Side] || 0;
                    let border = format[side];
                    let padding = 0;
                    let width = 0;
                    if(border) {
                        ( {padding, width} = border);
                    }
                    this.margin = margin;
                    this.padding = padding;
                    this.width = width;
                    this.border = border;
                }
            }
            class BoxSides {
                constructor(format) {
                    let sides = ['left', 'right', 'top', 'bottom'];
                    for(let side of sides ) {
                        this[side] = new BoxSide(side, format);
                    }
                }
            }

            function adjustLine(n) {
                return Math.floor(n) + 0.5;
            }

            class ParaBox {
                constructor(format) {
                    this.format = format;
                }
                get sides() {
                    if(!this._sides)
                        this._sides = new BoxSides(this.format);
                    return this._sides;
                }
                getBorderBox(aBox) {
                    let {x, y, width, contentHeight} = aBox;
                    let {left: leftSide, right: rightSide,
                        top: topSide, bottom: bottomSide} = this.sides;

                    let left = adjustLine(x + leftSide.margin -
                        leftSide.padding - leftSide.width);
                    let right = adjustLine(x + width -
                        rightSide.margin + rightSide.padding + rightSide.width);
                    let top = adjustLine(y + topSide.margin);
                    let bottom = adjustLine(top + contentHeight +
                        topSide.padding + topSide.width + bottomSide.padding);
                    return {left, right, top, bottom};
                }
                getBoxHeight(contentHeight) {
                    let {top, bottom} = this.sides;
                    return contentHeight + top.margin + top.padding + top.width
                        + bottom.margin + bottom.padding + bottom.width;
                }
                getContentWidth(width) {
                    let {left, right} = this.sides;
                    return width - left.margin - right.margin;
                }
                getContentHeight(height) {
                    let {top, bottom} = this.sides;
                    return height - top.margin - top.padding - top.width
                        - bottom.margin - bottom.padding - bottom.width;
                }
                getOffsetX(x) {
                    let {left} = this.sides;
                    return x + left.margin;
                }
                getOffsetY(y) {
                    let {top} = this.sides;
                    return y + top.margin + top.padding + top.width;
                }
            }

            class ParaWrapper {
                constructor(options) {
                    this.options = options;
                    this.para = options.para;
                    this.styleMap = options.styleMap;
                }
                isBr(type) {
                    let brs = this.para._element.xpath(`.//w:br[@w:type="${type}"]`);
                    if(brs.length > 0) {
                        if(brs.length > 1) {
                            console.log("more than 1 brs", type);
                        }
                        return true;
                    }
                    return false;
                }
                get isPageBr() {
                    return this.isBr("page");
                }
                get isColBr() {
                    return this.isBr("column");
                }
                get isSectPr() {
                    let pPr = this.para._element.pPr;
                    if(pPr && pPr.sectPr)
                        return true;
                }
                initLines(layout) {
                    this.layout = layout;
                    let width = layout.getColumn().width;
                    let contentWidth = this.format.getContentWidth(width);
                    //if(contentWidth != width)
                    //    console.log(width, contentWidth, 'contentWidth', this.format);
                    this.words = new WordLoader({...this.options,
                        runs: this.para.contentIter(), para: this});
                    this.lines = new LineLoader(this.words, contentWidth);
                    this.preLine = null;
                }
                get format() {
                    if(!this._format)
                        this._format = new ParaFormat(this.para, this.styleMap);
                    return this._format;
                }
                get font() {
                    if(!this._font)
                        this._font = new ParaFont(this.para, this.styleMap).font;
                    return this._font;
                }
                wrap() {
                    let line = this.preLine || this.lines.nextLine();
                    this.preLine = null;
                    let col = this.layout.getColumn();
                    let div = col.getDiv(this);
                    while(line) {
                        if(div.addLine(line)) {
                            line = this.lines.nextLine();
                        } else {
                            let nextWidth = this.layout.nextColWidth();
                            if(nextWidth !== col.width) {
                                let adjustLine = this.lines.backward(this.format.getContentWidth(nextWidth));
                                if(adjustLine) {
                                    div.popLine();
                                    line = this.lines.nextLine();
                                    div.addLine(line);
                                }
                            } else {
                                this.preLine = line;
                            }
                            if(!div.isEmpty) {
                                col.addDiv(div);
                            }
                            return {colDone: true};
                        }
                    }
                    if(!div.isEmpty)
                        col.addDiv(div);
                    return {paraDone: true};
                }
            }

            class ParaLoader extends IterLoader {
                setIter(options) {
                    let {contentIter} = options;
                    this.iter = contentIter;
                    this.options = options;
                }
                pack(para) {
                    if(para.contentIter){
                        return new ParaWrapper({...this.options, para});
                    }
                }
            }

            function *wrapParas(paras, options) {
                let {layout} = options;
                for(let para of paras) {
                    if(para.isPageBr) {
                        yield layout.currentPage;
                        if(para.isSectPr) {
                            layout.switchSect();
                        } else
                            layout.newPage();
                        continue;
                    }
                    if(para.isColBr) {
                        let {page} = layout.switchCol();
                        if(page) {
                            yield page;
                        }
                        //continue;
                    }
                    if(para.isSectPr) {
                        let {page} = layout.switchSect();
                        if(page) {
                            yield page;
                        }
                        continue;
                    }
                    para.initLines(layout);
                    for(;;) {
                        let {colDone, paraDone} = para.wrap(layout);
                        if(colDone) {
                            if(layout.pageDone) {
                                yield layout.currentPage;
                                layout.newPage();
                            }
                        } else if(paraDone) {
                            break;
                        } else {
                            console.log('no ret state');
                        }
                    }
                }
                if(layout.currentPage.notEmpty)
                    yield layout.currentPage;
            }

            class PageLoader extends IterLoader {
                setIter(options) {
                    this.paras = new ParaLoader(options);
                    this.iter = wrapParas(this.paras, options);
                }
                setOptions(options) {
                    this.iter = wrapParas(this.paras, options);
                    this.reset({});
                }
            }

            class SectPrs extends IterLoader {
                setIter(options) {
                    this.iter = options.sections.iter();
                }
                pack(value) {
                    return new SectPr(value);
                }
            }
            class SectPr {
                constructor(sectPr) {
                    this.section = sectPr;
                }
                eqDim(sectPr) {
                    let attrs = ['leftMargin', 'rightMargin', 'pageWidth',
                        'topMargin', 'bottomMargin', 'pageHeight'];
                    for(let attr of attrs) {
                        //console.log(section.dim[p], this.dim[p])
                        if(sectPr.dim[attr] !== this.dim[attr])
                            return false;
                    }
                    return true;
                }
                get width() {
                    return this.dim.width;
                }
                get height() {
                    return this.dim.height;
                }
                get columnConfigs() {
                    if(this._cols) return this._cols;
                    let cols = this.section._sectPr.cols;
                    if (!cols) {
                        this._cols = [this.defaultCol];
                        return this._cols;
                    }
                    let col_lst = cols.col_lst;
                    if(col_lst.length === 0) {
                        this._cols = [this.defaultCol];
                        return this._cols;
                    }
                    let _cols = [];
                    for(let col of col_lst) {
                        let space = col.space ? col.space.px : 0;
                        let width = col.w.px;
                        _cols.push({width, space });
                    }
                    this._cols = _cols;
                    return this._cols;
                }

                get dim() {
                    if(this._dim) return this._dim;
                    if(this.section.left_margin){
                        let leftMargin = this.section.left_margin.px;
                        let rightMargin = this.section.right_margin.px;
                        let pageWidth = this.section.page_width.px;
                        let width = pageWidth - leftMargin - rightMargin;
                        let topMargin = this.section.top_margin.px;
                        let bottomMargin = this.section.bottom_margin.px;
                        let pageHeight = this.section.page_height.px;
                        let height = pageHeight - topMargin - bottomMargin;
                        this._dim = {leftMargin, rightMargin, pageWidth, width,
                            topMargin, bottomMargin, pageHeight, height};
                    } else {
                        this._dim = this.defaultDim;
                    }
                    return this._dim;
                }
                get defaultDim() {
                    return {
                        //borderWidth: '1px',
                        //borderStyle: 'solid',
                        //borderColor: 'darkgray',
                        //backgroundColor: 'white',
                        leftMargin: 120,
                        rightMargin: 120,
                        pageWidth: 816,
                        width: 576,
                        topMargin: 96,
                        bottomMargin: 96,
                        pageHeight: 1056,
                        height: 864
                    };
                }
                get defaultCol() {
                    return {
                        width: this.width,
                        space: 0
                    }
                }
            }

            class Div {
                constructor(options) {
                    this.options = options;
                    this.width = options.width;
                    this.maxHeight = options.maxHeight;
                    //this.para = options.para;
                    this.format = options.para.format;
                    this.availableHeight = this.format.getContentHeight(this.maxHeight);
                    this.lines = [];
                }

                addLine(line) {
                    let {height} = this.format.getLineHeight(line.wordsHeight);
                    line.contentHeight = height;
                    if(height <= this.availableHeight) {
                        this.lines.push(line);
                        this.availableHeight -= height;
                        return true;
                    }
                    return false;
                }
                get linesHeight() {
                    if(this._linesHeight) return this._linesHeight;
                    let h = 0;
                    for(let line of this.lines) {
                        h += line.contentHeight;
                    }
                    this._linesHeight = h;
                    return this._linesHeight;
                }
                get boxHeight() {
                    return this.format.getBoxHeight(this.linesHeight);
                }
                getOffsetX(x) {
                    return this.format.getOffsetX(x);
                }
                getOffsetY(y) {
                    return this.format.getOffsetY(y);
                }
                getBorders(x, y) {
                    let aBox = {x, y, width: this.width, contentHeight: this.linesHeight};
                    return this.format.getBorders(aBox);
                }
                get isEmpty() {
                    return this.lines.length === 0;
                }
                get notEmpty() {
                    return this.lines.length > 0;
                }
                popLine() {
                    let line = this.lines.pop();
                    this.availableHeight += line.height;
                }
            }

            class Column {
                constructor(config, maxHeight) {
                    this.config = config;
                    this.maxHeight = maxHeight;
                    this.width = config.width;
                    this.space = config.space;
                    this.divs = [];
                }
                get availableHeight() {
                    let h = this.maxHeight;
                    for(let div of this.divs) {
                        h -= div.boxHeight;
                    }
                    return h;
                }
                get height() {
                    let h = 0;
                    for(let div of this.divs) {
                        h += div.boxHeight;
                    }
                    return h;
                }

                addDiv(div) {
                    this.divs.push(div);
                }

                getDiv(para) {
                    return new Div({maxHeight: this.availableHeight, width: this.width, para});
                }
                get notEmpty() {
                    if(this.divs.length > 0) return true;
                }

            }

            class Sect {
                constructor(sectPr, maxHeight) {
                    this.sectPr = sectPr;
                    this.maxHeight = maxHeight;
                    this.columnNums = sectPr.columnConfigs.length;
                    this.columnConfigs = sectPr.columnConfigs;
                    this.configIndex = 0;
                    this.columns = [];
                    this.newColumn();
                }
                get moreColumn() {
                    return this.columnNums > this.columns.length;
                }
                newColumn() {
                    if(!this.moreColumn) return null;
                    let config = this.columnConfigs[this.configIndex++];
                    this.currentColumn = new Column(config, this.maxHeight);
                    this.columns.push(this.currentColumn);
                    return this.currentColumn;
                }
                switchCol() {
                    return this.newColumn();
                }
                nextColWidth() {
                    let index;
                    if(!this.moreColumn) {
                        index = 0;
                    } else {
                        index = this.configIndex + 1;
                    }
                    let config = this.columnConfigs[index];
                    return config.width;
                }
                get height() {
                    let h = 0;
                    for(let col of this.columns) {
                        h = Math.max(h, col.height);
                    }
                    return h;
                }
                get notEmpty() {
                    if(this.columns.length > 1) return true;
                    return this.currentColumn.notEmpty;
                }
            }

            class Page {
                constructor(sectPr) {
                    this.sectPr = sectPr;
                    //this.options = options;
                    this.sects = [];
                    let {width, height} = sectPr;
                    this.width = width;
                    this.maxHeight = height;
                    this.newSect(sectPr);
                }
                get availableHeight() {
                    let h = this.maxHeight;
                    for(let sect of this.sects) {
                        h -= sect.height;
                    }
                    return h;
                }
                newSect(sectPr) {
                    this.currentSect = new Sect(sectPr, this.availableHeight);
                    this.sects.push(this.currentSect);
                }
                switchSect(sectPr) {
                    if(this.sectPr.eqDim(sectPr)) {
                        this.newSect(sectPr);
                        return this.currentSect;
                    }
                }
                switchCol() {
                    return this.currentSect.switchCol();
                }
                get pageDone() {
                    return !this.currentSect.moreColumn;
                }
                get notEmpty() {
                    if(this.sects.length > 1) return true;
                    return this.currentSect.notEmpty;
                }
            }

            class Layout {
                constructor(sectPrs) {
                    this.sectPrs = sectPrs;
                    this.prIndex = 0;
                    this.newPage();
                }
                get currentPr() {
                    return this.sectPrs.item(this.prIndex);
                }
                newPage() {
                    let page = new Page(this.currentPr);
                    this.currentPage = page;
                    return page;
                }
                getPage() {
                    return this.currentPage;
                }
                switchSect() {
                    this.prIndex++;
                    let sect = this.currentPage.switchSect(this.currentPr);
                    if(sect) return {sect};
                    else {
                        let page = this.currentPage;
                        this.newPage(this.currentPr);
                        return {page};
                    }
                }
                switchCol() {
                    let col = this.currentPage.switchCol();
                    if(col) return {col};
                    else {
                        let page = this.currentPage;
                        this.newPage(this.currentPr);
                        return {page};
                    }
                }
                pageDone() {
                    return this.currentPage.pageDone;
                }
                getColumn() {
                    return this.currentPage.currentSect.currentColumn;
                }
                nextColWidth() {
                    return this.currentPage.currentSect.nextColWidth();
                }
            }

            class StyleConv {
                static prConv = PrConv;
                constructor(style, styleMap) {
                    this.style = style;
                    this.styleMap = styleMap;
                }
                get baseId() {
                    if (this.style.base_style)
                        return this.style.base_style.style_id;
                }
                get conv() {
                    if(!this._conv)
                        this._conv = this.constructor.fromStyle(this.style);
                    return this._conv;
                }
                get linkId() {
                    let elem = this.style._element;
                    let link = elem.find('w:link');
                    if(link){
                        return link.getAttribute("w:val");
                    }
                }
                get name() {
                    return this.style.name;
                }
                get styleId() {
                    return this.style.style_id;
                }
                static fromStyle(style, theme) {
                    let pr = this.prConv.getStylePr(style);
                    if(pr){
                        let conv = this.prConv.prToConv(pr, theme);
                        return conv;
                    } else {
                        return {};
                    }
                }
            }

            class FormatConv extends StyleConv {
                static prConv = PPrConv;
                //constructor(style, styleMap) {
                //    super(style, styleMap);
                //    this.numberingMap = styleMap.numberingMap;
                //}
                get formatElement() {
                    return this.format._element;
                }
                get conv() {
                    if(!this._conv) {
                        let base = this.styleMap.idToFormat(this.baseId);
                        let conv = this.constructor.fromStyle(this.style);
                        if(base)
                            this._conv = {...base.conv, ...conv};
                        else
                            this._conv = conv;
                    }
                    return this._conv;
                }
                //get numberingObj() {
                //    let numbering = this.numberingMap.get(this.styleId);
                //    return numbering ? numbering.styleObj : null;
                //}
                get font() {
                    if(!this._font) {
                        let linkId = this.linkId;
                        if(linkId) {
                            let fontConv = this.styleMap.idToFont(linkId);
                            //console.log(fontConv, fontConv.conv, 'font by linked', this.styleId)
                            //return fontConv.conv;
                            this._font = fontConv.conv;
                        } else {
                            let rpr = this.style._element.rPr;
                            if(rpr) {
                                let conv = RPrConv.prToConv(rpr, this.styleMap.theme);
                                //console.log(conv, 'font by style rpr', this.styleId);
                                //return conv;
                                this._font = conv;
                            } else {
                                //console.log('font by style rpr, no rpr', this.styleId);
                                this._font = {};
                            }
                        }
                    }
                    return this._font;
                }
            }


            class FontConv extends StyleConv {
                static prConv = RPrConv;
                constructor(style, styleMap) {
                    super(style, styleMap);
                    this.theme = styleMap.theme;
                }
                get conv() {
                    if(!this._conv) {
                        let base = this.styleMap.idToFont(this.baseId);
                        let conv = this.constructor.fromStyle(this.style, this.theme );
                        if(base)
                            this._conv = {...base.conv, ...conv};
                        else
                            this._conv = conv;
                    }
                    return this._conv;
                }
                get fontElement() {
                    return this.font._element;
                }
            }

            //import {TableStyleConv} from "./tblStyleConv";


            class StyleConvMap {
                constructor(styleMap) {
                    this.styleMap = styleMap;
                    this.idTo = new Map();
                    this.nameTo = new Map();
                    this.idToName = new Map();
                }
                addStyle(style) {
                    let conv = this.newConv(style);
                    this.addConv(conv);
                }
                addConv(conv) {
                    let {styleId, name} = conv;
                    this.idTo.set(styleId, conv);
                    this.nameTo.set(name, conv);
                    this.idToName.set(styleId, name);
                }
                getConv(name) {
                    return this.nameTo.get(name);
                }
            }

            class FormatConvMap extends  StyleConvMap {
                newConv(style) {
                    return new FormatConv(style, this.styleMap)
                }
            }

            class FontConvMap extends  StyleConvMap {
                newConv(style) {
                    return new FontConv(style, this.styleMap)
                }
                addConv(conv, formatConvMap) {
                    let {styleId, name, linkId} = conv;
                    this.idTo.set(styleId, conv);
                    this.nameTo.set(name, conv);
                    this.idToName.set(styleId, name);
                    if(linkId) {
                        let formatName = formatConvMap.idToName.get(linkId);
                        this.nameTo.set(formatName, conv);
                    }
                }
            }

            //, TableStyleConvMap

            class StyleMap {
                constructor(styles, theme) {
                    this.styles = styles;
                    this.theme = theme;
                    //this.numberingMap = numberingMap;

                    this.formatConvMap = new FormatConvMap(this);
                    this.fontConvMap = new FontConvMap(this);
                    //this.tableStyleConvMap = new TableStyleConvMap(this);

                    this.loadStyles();
                    this.loadDefaults();
                }
                loadStyles(){
                    for(let style of this.styles) {
                        let type = style.type;
                        if (type===1){
                            let formatConv = new FormatConv(style, this);
                            this.formatConvMap.addConv(formatConv);
                        } else if(type===2){
                            let fontConv = new FontConv(style, this);
                            this.fontConvMap.addConv(fontConv, this.formatConvMap);
                        } else ;
                    }
                }
                loadDefaults() {
                    let format = this.styles.default_format();
                    let conv = {
                        marginLeft: 0,
                        marginRight: 0,
                        marginTop: 0,
                        marginBottom: 0,
                        lineSpacing: new LineSpacingConv()
                    };
                    if(format){
                        let formatConv = FormatConv.fromStyle(format);
                        Object.assign(conv, formatConv);
                        console.log('default format', conv);
                    }
                    this.defaultFormat = conv;
                    let font = this.styles.default_font();
                    let conv2 = {};
                    if(font){
                        let fontConv = FontConv.fromStyle(font, this.theme);
                        Object.assign(conv2, fontConv);
                        console.log('default font', conv2);
                    }
                    this.defaultFont = conv2;
                }
                getFont(name) {
                    let font = this.fontConvMap.getConv(name);
                    if(font) {
                        return font.conv
                    }
                    return null;
                }
                getFormat(name) {
                    let format = this.formatConvMap.getConv(name);
                    if(format) {
                        return format.conv
                    }
                    return null;
                }
                //getFormatNumbering(name) {
                //    let format = this.formatConvMap.getConv(name);
                //    if(format)
                //        return format.numberingObj;
                //}
                idToFont(id) {
                    return this.fontConvMap.idTo.get(id);
                }
                idToFontName(id) {
                    return this.fontConvMap.idToName.get(id);
                }
                idToFormat(id) {
                    return this.formatConvMap.idTo.get(id);
                }
                idToFormatName(id) {
                    return this.formatConvMap.idToName.get(id);
                }
            }

            class Theme {
                constructor(theme) {
                    this.theme = theme;
                }
                get majorFont() {
                    return this.getMFont('major');
                }
                get minorFont() {
                    return this.getMFont('minor');
                }
                getMFont(m) {
                    let fKey = m + 'Font';
                    let _fKey = '_' + fKey;
                    let cached = this[_fKey];
                    if(cached || cached===null) return cached;
                    let fontEle = this.theme[fKey];
                    if(fontEle) {
                        let mFont = new MFont(fontEle);
                        this[_fKey] = mFont.fontObj;
                    } else
                        this[_fKey] = null;
                    return this[_fKey];
                }

            }
            const cjkScripts = ['Hans', 'Hant', 'Jpan', 'Hang' ];
            const csScripts = ['Arab', 'Hebr', 'Thaa', 'Thai', 'Viet'];
            class MFont {
                constructor(mFont) {
                    this.mFont = mFont;
                }
                get ascii() {
                    return this.mFont.latin.typeface;
                }
                get ea() {
                    let ea = this.mFont.ea.typeface;
                    if(!ea) {
                        ea = this.getScheme(cjkScripts);
                    }
                    //console.log('mFont', ea);
                    return ea;
                }
                get cs() {
                    let cs = this.mFont.cs.typeface;
                    if(!cs) {
                        cs = this.getScheme(csScripts);
                    }
                    //console.log('mFont', cs);
                    return cs;
                }
                getScheme(scripts) {
                    let {typeFaces} = this;
                    let a = [];
                    for(let script of scripts) {
                        let font = typeFaces[script];
                        if(font)
                            a.push(font);
                    }
                    return a.join(', ');
                }
                get typeFaces() {
                    if(this._typeFaces) return this._typeFaces;
                    let ls = this.mFont.font_lst;
                    let tfs = {};
                    for (let font of ls) {
                        //console.log(font.script, font.typeface);
                        tfs[font.script] = `"${font.typeface}"`;
                    }
                    this._typeFaces = tfs;
                    return this.typeFaces;
                }
                get fontObj() {
                    let {ea, cs, ascii} = this;
                    return {ea, cs, ascii}
                }
            }

            class DocLayout {
                constructor(doc) {
                    let theme = new Theme(doc.theme);
                    let sectPrs = new SectPrs({sections: doc.sections});
                    let layout = new Layout(sectPrs);
                    let styleMap = new StyleMap(doc.styles, theme);
                    let contentIter = doc._body.contentIter();
                    this.pages = new PageLoader({
                        contentIter,
                        layout,
                        styleMap,
                        doc,
                    });
                }
            }

            let partPool = new WeakMap();

            class SimpleText extends Text {
                _sceneFunc(context) {
                    let text = this.getAttr('text');
                    let fontString = this.getAttr('fontString');
                    context.setAttr('font', fontString);
                    //let fontSize = this.getAttr('fontSize');
                    //console.log(this.attrs, 'simple text attrs');
                    //context.setAttr('fontStretch', 'extra-condensed');
                    //context.setAttr('letterSpacing', `${-0.05*fontSize}pt`);

                    //this._partialTextX = 0;
                    //this._partialTextY = 0;
                    this._partialText = text;
                    context.fillStrokeShape(this);
                }

            }

            class PartView extends Group$2 {

                constructor(part, x, y) {
                    super({});
                    this.part = part;
                    this.ox = x;
                    this.oy = y;
                    this.simpleText;
                }
                setPart(part, _x, _y) {
                    let text = this.simpleText.getAttr('text');
                    this.simpleText.setPosition({x: _x, y: _y});
                    if(text != part.text){
                        this.simpleText.setAttr('text', part.text);
                        //console.log(text, part.text);
                    }
                }

                get simpleText() {
                    let text = new SimpleText({
                        x: this.ox,
                        y: this.oy,
                        text: this.part.text,
                        ...this.part.fontStyle,
                    });
                    this.add( text );
                    return text;

                }

            }

            let { Group: Group$1, Rect: Rect$2, Line } = Konva;

            class DivView extends Group$1 {

                renderBorders(div, x, y) {
                    let {left, right, top, bottom, backgroundColor, borderBox} = div.getBorders(x, y);
                    if(backgroundColor) {
                        let bg = new Rect$2({
                                x: borderBox.left,
                                y: borderBox.top,
                                width: borderBox.right - borderBox.left,
                                height: borderBox.bottom - borderBox.top,
                                fill: backgroundColor,
                        });
                        this.add(bg);
                    }
                    if(left) {
                        let border = new Line({
                            points: [borderBox.left, borderBox.top, borderBox.left, borderBox.bottom],
                            stroke: left.color,
                            strokeWidth: left.width,
                            //lineDash: [10, 10],
                        });
                        this.add(border);
                    }
                    if(right) {
                        let border = new Line({
                            points: [borderBox.right, borderBox.top, borderBox.right, borderBox.bottom],
                            stroke: right.color,
                            strokeWidth: right.width
                        });
                        this.add(border);
                    }
                    if(top) {
                        let border = new Line({
                            points: [borderBox.left, borderBox.top, borderBox.right, borderBox.top],
                            stroke: top.color,
                            strokeWidth: top.width
                        });
                        this.add(border);
                    }
                    if(bottom) {
                        let border = new Line({
                            points: [borderBox.left, borderBox.bottom, borderBox.right, borderBox.bottom],
                            stroke: bottom.color,
                            strokeWidth: bottom.width
                        });
                        this.add(border);
                    }
                }
                renderDiv(div, x, y) {
                    this.renderBorders(div, x, y);
                    let _x = div.getOffsetX(x);
                    let _y = div.getOffsetY(y);
                    for(let line of div.lines) {
                        this.renderLine(line, _x, _y + line.wordsHeight - line.descent);
                        _y += line.contentHeight;
                    }
                }
                renderLine(line, x, y) {
                    for(let word of line.words) {
                        this.renderWord(word, x, y);
                        x += word.width;
                    }
                }
                renderWord(word, x, y) {
                    for(let part of word.parts) {
                        this.renderPart(part, x, y);
                        x += part.width;
                    }
                }
                renderPart(part, x, y) {
                    let partView = this.getPartView(part, x, y);
                    this.add(partView);
                }
                getPartView(part, x, y) {
                    let partView = partPool.get(part);
                    if(partView) {
                        partView.setPart(part, x, y);
                    } else {
                        partView = new PartView(part, x, y);
                        partPool.set(part, partView);
                    }
                    return partView;
                }
            }

            let { Group, Rect: Rect$1 } = Konva;

            class PageView extends Group {
                constructor({page, width, height, y = 55.5}) {
                    super({});
                    let {pageWidth, leftMargin, topMargin} = page.sectPr.dim;
                    let x = (width - pageWidth) / 2;
                    this.page = page;
                    this.canvasWidth = width;
                    this.canvasHeight = height;
                    this.ox = x;
                    this.oy = y;
                    this.contentX = x + leftMargin;
                    this.contentY = y + topMargin;
                }
                get pageDim() {
                    return this.page.sectPr.dim;
                }

                renderPage(page) {
                    this.renderOutline();
                    let {contentX, contentY} = this;
                    for (let sect of page.sects) {
                        this.renderSect(sect, contentX, contentY, this);
                        contentY += sect.height;
                    }
                }

                renderOutline() {
                    let {pageWidth, pageHeight, width, height} = this.pageDim;
                    const pageRect = new Rect$1({
                            x: this.ox,
                            y: this.oy,
                            width: pageWidth,
                            height: pageHeight,
                            fill: '#f5f5f5'
                    });
                    this.add(pageRect);
                    const contentRect = new Rect$1({
                        x: this.contentX,
                        y: this.contentY,
                        width,
                        height,
                        fill: 'white'
                    });
                    this.add(contentRect);
                }

                renderSect(sect, x, y, canvas) {
                    for (let col of sect.columns) {
                        this.renderCol(col, x, y, canvas);
                        x += col.width;
                        x += col.space;
                    }
                }

                renderCol(col, x, y, canvas) {
                    for (let div of col.divs) {
                        let divView = new DivView({});
                        divView.renderDiv(div, x, y, canvas);
                        y += div.boxHeight;
                        canvas.add(divView);
                    }
                }
            }

            let {Layer, Rect} = Konva;

            class DocView {

                constructor(docLayout, stage) {
                    this.docLayout = docLayout;
                    this.stage = stage;
                    let width = stage.width();
                    let height = stage.height();
                    this.canvasConfig = {width, height};
                    this.renderBg();
                    let layer = new Layer();
                    stage.add(layer);
                    this.canvas = layer;
                    this.pageViews = [];
                    this.renderedPages = [];
                }

                renderBg() {
                    let layer = new Layer();
                    let bg = new Rect({
                        x: 0,
                        y: 0,
                        fill: 'lightsteelblue',
                        strokeWidth: 1,
                        ...this.canvasConfig
                    });
                    layer.add(bg);
                    this.stage.add(layer);
                }

                getPageView(index) {
                    let pageView = this.pageViews[index];
                    if(!pageView) {
                        let page = this.docLayout.pages.item(index);
                        if(!page) {
                            let len = this.docLayout.pages.items.length;
                            return {pageView: null, len};
                        }
                        pageView = this.renderPageView(page);
                        this.pageViews[index] = pageView;
                        console.log(this.docLayout);
                        console.log(this);
                    }
                    return {pageView};
                }
                renderPageView(page) {
                    let pageView = new PageView({page, ...this.canvasConfig });
                    pageView.renderPage(page);
                    return pageView;
                }
                renderPageByIndex(index) {
                    let {pageView, len} = this.getPageView(index);
                    if(!pageView) {
                        if(len) {
                            console.log('page count', len);
                            ({pageView} = this.getPageView(len - 1) );

                        } else
                            return;
                    }
                    if(!pageView) {
                        console.log("no pages");
                        return;
                    }
                    let pageNo = len? len : index + 1;
                    console.log('page ', pageNo);
                    this.clearCanvas();
                    this.canvas.add(pageView);
                    this.renderedPages.push(pageView);
                    fontChecker.check();
                }
                clearCanvas() {
                    this.canvas.removeChildren();
                    this.renderedPages.length = 0;
                }

            }

            const gui = new GUI({
                    //container: gui_wrapper,
                    //autoPlace: false
                }
            );

            const pageFolder = gui.addFolder('select page');
            const pageConfig = {
                pageIndex: 0,
            };

            pageFolder
                .add(pageConfig, 'pageIndex', 0, 200, 0.01)
                .onChange((pageIndex) => {
                   docxView.renderPageByIndex(Math.floor(pageIndex));
                });

            let docxView = null;

            function getDocView(docx) {
                if(docxView) {
                    docxView.clearCanvas();
                }
                let docLayout = new DocLayout(docx);
                let stage = new Konva.Stage({
                    container: 'container',
                    width: 1200,
                    height: 1200,
                });
                docxView = new DocView(docLayout, stage);
                return docxView;
            }

            exports.getDocView = getDocView;

            Object.defineProperty(exports, '__esModule', { value: true });

            return exports;

})({});
//# sourceMappingURL=viewer.js.map
