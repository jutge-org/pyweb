
var the_demos = [
    {
        name: "Bon dia!",
        code: `
nom = input('Com et dius? ')

print("Bon dia", nom)
`,
    },
    {
        name: "Dibuixar un quadrat",
        code: `
import turtle

m = int(input('Mida del quadrat? '))
print("D'acord, pinto un quadrat de mida", m)
for i in range(4):
    turtle.forward(m)
    turtle.right(90)
turtle.done()
`,
    },
    {
        name: "Dibuixar un triangle",
        code: `
from turtle import *

m = int(input('Mida del triangle? '))
forward(m)
right(120)
forward(m)
right(120)
forward(m)
right(120)
done()
`,
    },
    {
        name: "Factorial",
        code: `
n = int(input('Digues un número: '))
f = 1
for i in range(2, n + 1):
    f = f * i 
print("El factorial de", n, "és", f)
`,
    },
    {
        name: "Màxim comú divisor",
        code: `
a = int(input('Digues un primer número: '))
b = int(input('Digues un segon número: '))
while a != b:
    if a > b:
        a = a - b 
    else:
        b = b -a
print("El màxim comú divisor dels dos nombres és", a)
`,
    },
];
var the_editor = null;

var the_code = get_code_from_url();


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
                                value: "<span title='Executar' style='font-size: x-large;'>▶️</span>",
                                on: {
                                    onItemClick() {
                                        run();
                                    }
                                },
                                autowidth: true,
                            },
                            {
                                view: "button",
                                value: "<span title='Esborrar consola' style='font-size: x-large;'>⏹</span>",
                                on: {
                                    onItemClick() {
                                        clear();
                                    }
                                },
                                autowidth: true,
                            },
                            {
                                view: "button",
                                value: "<span title='Reiniciar' style='font-size: x-large;'>🔄</span>",
                                on: {
                                    onItemClick() {
                                        reset();
                                    }
                                },
                                autowidth: true,
                            },
                            {
                                view: "button",
                                value: "<span title='URL per compartir' style='font-size: x-large;'>⤴️</span>",
                                on: {
                                    onItemClick() {
                                        export_program();
                                    }
                                },
                                autowidth: true,
                            },
                            {
                                view: "button",
                                value: "<span title='Demostracions' style='font-size: x-large;'>*️⃣</span>",
                                on: {
                                    onItemClick() {
                                        demos();
                                    }
                                },
                                autowidth: true,
                            },
                            {
                                view: "button",
                                value: "<span title='Informació' style='font-size: x-large;'>ℹ️</span>",
                                on: {
                                    onItemClick() {
                                        info();
                                    }
                                },
                                autowidth: true,
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
                        template: "<pre id='canvas'></pre>",
                        scroll: "xy",
                        // height: 400,
                    },
                    {
                        view: "resizer"
                    },
                    {
                        template: "<pre id='console'></pre>",
                        scroll: "xy",
                    },
                ]
            }
        ]
    });

    the_editor = ace.edit("editor");
    the_editor.setHighlightActiveLine(false);
    the_editor.container.style.lineHeight = 1.5;
    the_editor.renderer.updateFontSize();
    the_editor.session.setMode("ace/mode/python");
    the_editor.setTheme("ace/theme/chrome");
    the_editor.setOptions({
        fontFamily: "Menlo",
        fontSize: "12pt"
    });
    the_editor.setShowPrintMargin(false);
    reset();


    // sembla que el id 0 no funciona
    var data = [];
    for (var i = 0; i < the_demos.length; ++i) {
        data.push({ id: i + 1, title: the_demos[i].name });
    }

    the_demos_window = webix.ui({
        view: "window",
        id: "my_win",
        head: "Tria un programa",
        width: 200,
        height: 500,
        body: {
            rows: [
                {
                    view: "list",
                    width: 250,
                    height: 200,
                    template: "#title#",
                    select: true,
                    data: data,
                    id: "llista",
                },
                {
                    cols: [
                        {
                            view: "button",
                            value: "D'acord",
                            on: {
                                onItemClick() {
                                    var index = $$("llista").getSelectedId() - 1;
                                    console.log(index)
                                    var demo = the_demos[index];
                                    set_code(`# ${demo.name}\n${demo.code}`);
                                    the_demos_window.hide();
                                }
                            },
                            autowidth: true,
                        },

                        {
                            view: "button",
                            value: "Cancel·lar",
                            on: {
                                onItemClick() {
                                    the_demos_window.hide();
                                }
                            },
                            autowidth: true,
                        },

                    ],
                },
            ],
        },
        modal: true,
    });

}


function get_code_from_url() {
    const parameters = new URLSearchParams(window.location.search);
    const code = parameters.get('code');

    if (code == null) {
        demo = the_demos[0];
        return `# ${demo.name}\n${demo.code}`;
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
        output: write_to_console,
        //read: builtinRead,
        inputfun: ask_input,
        inputfunTakesPrompt: true /* then you need to output the prompt yourself */
    });
    (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'canvas';
    var myPromise = Sk.misceval.asyncToPromise(function () {
        return Sk.importMainWithBody("<stdin>", false, prog, true);
    });
    myPromise.then(function (mod) {
        write_to_console("<i>Final del programa</i>\n", "darkgreen");
    },
        function (err) {
            write_to_console("<i>" + err.toString() + "</i>\n", "orange");
        });
}


// see https://github.com/skulpt/skulpt/issues/685
function ask_input(a_prompt) {
    return new Promise((resolve, reject) => {
        write_to_console(a_prompt);
        webix.prompt({
            title: "input",
            text: a_prompt,
            ok: "D'acord",
            cancel: "Cancel·la",
        }).then(function (result) {
            write_to_console(result + "\n", "Blue");
            resolve(result);
        }).fail(function () {
            write_to_console("\n", "Blue");
            resolve("");
        });
    });
}


function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
        throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}


function set_code(code) {
    the_editor.setValue(code, -1);
    the_editor.clearSelection();
    the_editor.focus();
}


function reset() {
    set_code(the_code);
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
    var element = document.getElementById("console");
    element.innerHTML += `<span style='color: ${color};'>${text}</span>`;
    element.scrollIntoView(false);
}


function export_program() {
    var prog = the_editor.getValue();
    var path = window.location.href.split('?')[0];
    var enc = btoa(prog);
    var url = `${path}?code=${enc}`;
    write_to_console(`URL per compartir el programa:\n`, "brown");
    write_to_console(`${url}\n`, "brown");
    write_to_console(`(copiada al porta-retalls)\n`, "brown");
    navigator.clipboard.writeText(url);
    /*
    webix.alert({
        title: "Comparteix el programa amb aquesta URL:",
        text: url,
    });
    */
}

function info() {
    text = `
<p><a href='https://github.com/jutge-org/pyweb' target='_blank'>https://github.com/jutge-org/pyweb</a></p>
    `;
    webix.alert({
        title: "Python on the web",
        text: text,
    });
}

function demos() {
    demo = the_demos[0];
    set_code(`# ${demo.name}\n${demo.code}`);
    the_demos_window.setPosition((window.innerWidth - 200) / 2, (window.innerHeight - 400) / 2);
    the_demos_window.show();
}
