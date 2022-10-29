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
                                        export_program();
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
                    {
                        view: "text",
                        id: "input",
                        // value: "value",
                        // label: "label",
                        on: {
                            onEnter() {
                                give_input();
                            }
                        },
                    },
                ]
            }
        ]
    });

    the_editor = ace.edit("editor");
    the_editor.setHighlightActiveLine(false);
    the_editor.session.setMode("ace/mode/python");
    the_editor.setTheme("ace/theme/chrome");
    the_editor.setOptions({
        fontFamily: "Menlo",
        fontSize: "10pt"
    });
    reset();
}


function get_code_from_url() {
    const parameters = new URLSearchParams(window.location.search);
    const code = parameters.get('code');

    if (code == null) {
        return `
a=int(input())
b=int(input())
print(a+b)
        `;
    }

    if (code.length > 5000) {
        return "# too long code\n";
    }

    return atob(code);
}


function run() {
    var prog = the_editor.getValue();
    Sk.pre = "console";
    Sk.configure({
        output: outf,
        //read: builtinRead,
        inputfun: input_function,
        inputfunTakesPrompt: true /* then you need to output the prompt yourself */
    });
    (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'canvas';
    var myPromise = Sk.misceval.asyncToPromise(function () {
        return Sk.importMainWithBody("<stdin>", false, prog, true);
    });
    myPromise.then(function (mod) {
        write_to_console("Done\n", "darkgreen");
    },
        function (err) {
            write_to_console(err.toString() + "\n", "orange");
        });
}


// see https://github.com/skulpt/skulpt/issues/685
function input_function(prompt) {
    return new Promise((resolve, reject) => {
        // ToDo: output prompt
        // ToDo: get input string
        // let input = "12";
        if (the_inputs.length > 0) {
            input = the_inputs.shift();
            resolve(input);
        }
    });
}


function outf(text) {
    write_to_console(text);
}


function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
        throw "File not found: '" + x + "'";
    console.log(999, x)
    console.log(Sk.builtinFiles["files"][x])
    return 12;
    return Sk.builtinFiles["files"][x];
}


function reset() {
    the_editor.setValue(the_code, -1);
    the_editor.clearSelection();
    the_editor.focus();
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


function write_to_console(text, color = "Black") {
    document.getElementById("console").innerHTML += `<span style='color: ${color};'>${text}</span>`;
}


function export_program() {
    var prog = the_editor.getValue();
    var path = window.location.href.split('?')[0];
    var enc = btoa(prog);
    var url = `${path}?code=${enc}`;
    write_to_console(`<a href="${url}">${url}</a>\n`, "blue");
}


function give_input() {
    var input = $$("input").getValue();
    $$("input").setValue("");
    the_inputs.push(input);
    console.log(the_inputs);
}


// main program
var the_editor = null;
var the_code = get_code_from_url();
var the_inputs = [];
