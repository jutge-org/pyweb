const urlParams = new URLSearchParams(window.location.search);
const myParam = urlParams.get('code');

if (myParam) {
    if (myParam.length > 5000) {
        code = "# too long code\n";
    } else {
        code = atob(myParam);
    }
} else {
    code = "";
}


function start() {
    webix.ui({
        cols: [
            {
                rows: [
                    {
                        view: "toolbar",
                        padding: 0,
                        elements: [
                            {},
                            {
                                view: "label",
                                label: "Lliçons",
                                autowidth: true,
                                hidden: true,
                            },
                            {
                                view: "button",
                                value: "▶️",
                                autowidth: true,
                                on: {
                                    onItemClick() {
                                        run();
                                    }
                                },
                            },
                            {
                                view: "button",
                                value: "⏹",
                                autowidth: true,
                                on: {
                                    onItemClick() {
                                        clear();
                                    }
                                },
                            },
                            {
                                view: "button",
                                value: "🔄",
                                autowidth: true,
                                on: {
                                    onItemClick() {
                                        reset();
                                    }
                                },
                            },
                            {
                                view: "button",
                                value: "⤴️",
                                autowidth: true,
                                on: {
                                    onItemClick() {
                                        export_prog();
                                    }
                                },
                            },
                            {},
                        ],
                    },

                    {
                        template: "<div id='editor'></div>",
                    },
                ],
            },
            { view: "resizer" },
            {
                rows: [
                    {
                        template: "<div id='canvas'></div>",
                    },
                    {
                        view: "resizer"
                    },
                    {
                        template: "<pre id='console'></pre>",
                    },
                ]
            }
        ]
    });

    editor = ace.edit("editor");
    editor.setHighlightActiveLine(false);
    editor.session.setMode("ace/mode/python");
    editor.setTheme("ace/theme/chrome");
    editor.setOptions({
        fontFamily: "Menlo",
        fontSize: "10pt"
    });
    reset();
}



function run() {
    var prog = editor.getValue();
    Sk.pre = "console";
    Sk.configure({ output: outf, read: builtinRead });
    (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'canvas';
    var myPromise = Sk.misceval.asyncToPromise(function () {
        return Sk.importMainWithBody("<stdin>", false, prog, true);
    });
    myPromise.then(function (mod) {
        write_console("Done\n", "darkgreen");
    },
        function (err) {
            write_console(err.toString() + "\n", "orange");
        });
}



function outf(text) {
    write_console(text);
}


function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
        throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}


function reset() {
    editor.setValue(code, -1);
    editor.clearSelection();
    editor.focus();
    clear();
}


function clear() {
    clear_canvas();
    clear_console();
}


function clear_canvas() {
    document.getElementById("canvas").innerHTML = "";
}


function clear_console() {
    document.getElementById("console").innerHTML = "";
}


function write_console(text, color = "Black") {
    var console = document.getElementById("console");
    console.innerHTML = console.innerHTML + `<span style='color: ${color};'>${text}</span>`;
}


function export_prog() {
    var prog = editor.getValue();
    var path = window.location.href.split('?')[0];
    var enc = btoa(prog);
    var url = `${path}?code=${enc}`;
    write_console(`<a href="${url}">${url}</a>\n`, "blue");
}