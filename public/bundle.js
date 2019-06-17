
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src\App.svelte generated by Svelte v3.5.1 */

    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	var div10, h1, t1, div9, div1, img0, t2, img1, t3, div0, label0, t4, t5, label1, t6, t7, t8, t9, t10, label2, t11, t12, div8, div2, img2, t13, h4, t15, input0, t16, form, h30, t18, input1, t19, h31, t21, input2, t22, div6, div4, div3, h32, t24, input3, t25, input4, t26, div5, h33, t28, input5, t29, div7, input6, dispose;

    	return {
    		c: function create() {
    			div10 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Nuevo método de pago";
    			t1 = space();
    			div9 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t2 = space();
    			img1 = element("img");
    			t3 = space();
    			div0 = element("div");
    			label0 = element("label");
    			t4 = text(ctx.numero_tarjeta);
    			t5 = space();
    			label1 = element("label");
    			t6 = text("Válido hasta: ");
    			t7 = text(ctx.mes_vencimiento);
    			t8 = text(" / ");
    			t9 = text(ctx.ano_vencimiento);
    			t10 = space();
    			label2 = element("label");
    			t11 = text(ctx.nombre);
    			t12 = space();
    			div8 = element("div");
    			div2 = element("div");
    			img2 = element("img");
    			t13 = space();
    			h4 = element("h4");
    			h4.textContent = "El método de pago fue agregado correctamente";
    			t15 = space();
    			input0 = element("input");
    			t16 = space();
    			form = element("form");
    			h30 = element("h3");
    			h30.textContent = "Número de la tarjeta";
    			t18 = space();
    			input1 = element("input");
    			t19 = space();
    			h31 = element("h3");
    			h31.textContent = "Nombre del tarjetahabiente";
    			t21 = space();
    			input2 = element("input");
    			t22 = space();
    			div6 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Fecha de Vencimiento";
    			t24 = space();
    			input3 = element("input");
    			t25 = space();
    			input4 = element("input");
    			t26 = space();
    			div5 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Código CCV";
    			t28 = space();
    			input5 = element("input");
    			t29 = space();
    			div7 = element("div");
    			input6 = element("input");
    			h1.className = "svelte-lrovuc";
    			add_location(h1, file, 107, 1, 3961);
    			img0.src = "./img/chip.png";
    			img0.alt = "chip_image";
    			img0.className = "chip_image svelte-lrovuc";
    			add_location(img0, file, 110, 3, 4067);
    			img1.src = ctx.src_card;
    			img1.alt = "card_image";
    			img1.className = "card_image svelte-lrovuc";
    			add_location(img1, file, 111, 3, 4134);
    			label0.className = "numero_tarjeta svelte-lrovuc";
    			add_location(label0, file, 114, 4, 4233);
    			label1.className = "valido_hasta svelte-lrovuc";
    			add_location(label1, file, 115, 4, 4292);
    			label2.className = "nombre_tarjetahabiente svelte-lrovuc";
    			add_location(label2, file, 116, 4, 4384);
    			div0.className = "container_data_card svelte-lrovuc";
    			add_location(div0, file, 113, 3, 4195);
    			div1.className = "card nocard svelte-lrovuc";
    			div1.id = "tarjeta";
    			add_location(div1, file, 109, 2, 4020);
    			img2.className = "img_check svelte-lrovuc";
    			img2.src = "./img/check.png";
    			img2.alt = "check_image";
    			add_location(img2, file, 122, 4, 4534);
    			h4.className = "titulo_agregado svelte-lrovuc";
    			add_location(h4, file, 123, 4, 4603);
    			attr(input0, "type", "button");
    			input0.className = "boton_agregar svelte-lrovuc";
    			input0.value = "Registrar otra tarjeta";
    			attr(input0, "onclick", "window.location.reload(true);");
    			add_location(input0, file, 124, 4, 4685);
    			div2.id = "guardado";
    			div2.className = "guardado svelte-lrovuc";
    			add_location(div2, file, 121, 3, 4491);
    			add_location(h30, file, 128, 4, 4841);
    			attr(input1, "type", "text");
    			input1.id = "numero_tarjeta";
    			input1.name = "numero_tarjeta";
    			input1.maxLength = "16";
    			input1.placeholder = "Número de tarjeta";
    			attr(input1, "onkeypress", "if ( isNaN( String.fromCharCode(event.keyCode) )) return false;");
    			input1.className = "text_field svelte-lrovuc";
    			input1.required = true;
    			add_location(input1, file, 129, 4, 4875);
    			add_location(h31, file, 132, 4, 5159);
    			attr(input2, "type", "text");
    			input2.name = "nombre_completo";
    			input2.maxLength = "30";
    			input2.placeholder = "Nombre completo";
    			input2.className = "text_field svelte-lrovuc";
    			input2.required = true;
    			add_location(input2, file, 133, 4, 5199);
    			add_location(h32, file, 139, 7, 5409);
    			attr(input3, "type", "text");
    			input3.id = "mes_vencimiento";
    			input3.maxLength = "2";
    			input3.placeholder = "Mes";
    			set_style(input3, "width", "40%");
    			attr(input3, "onkeypress", "if ( isNaN( String.fromCharCode(event.keyCode) )) return false;");
    			input3.required = true;
    			add_location(input3, file, 140, 7, 5447);
    			attr(input4, "type", "text");
    			input4.id = "ano_vencimiento";
    			input4.maxLength = "4";
    			input4.placeholder = "Año";
    			set_style(input4, "width", "40%");
    			attr(input4, "onkeypress", "if ( isNaN( String.fromCharCode(event.keyCode) )) return false;");
    			input4.required = true;
    			add_location(input4, file, 142, 7, 5672);
    			add_location(div3, file, 138, 6, 5396);
    			add_location(div4, file, 137, 5, 5382);
    			add_location(h33, file, 147, 6, 5934);
    			attr(input5, "type", "password");
    			input5.id = "ccv";
    			input5.maxLength = "3";
    			input5.placeholder = "CCV";
    			attr(input5, "onkeypress", "if ( isNaN( String.fromCharCode(event.keyCode) )) return false;");
    			input5.required = true;
    			add_location(input5, file, 148, 6, 5960);
    			add_location(div5, file, 146, 5, 5922);
    			div6.className = "container svelte-lrovuc";
    			add_location(div6, file, 136, 4, 5353);
    			attr(input6, "type", "submit");
    			input6.className = "boton_agregar svelte-lrovuc";
    			input6.id = "btnGuardar";
    			input6.value = "Agregar método de pago";
    			add_location(input6, file, 153, 5, 6177);
    			add_location(div7, file, 152, 4, 6166);
    			form.id = "form_card";
    			add_location(form, file, 127, 3, 4814);
    			div8.className = "data_card svelte-lrovuc";
    			add_location(div8, file, 120, 2, 4464);
    			div9.className = "container svelte-lrovuc";
    			add_location(div9, file, 108, 1, 3994);
    			div10.className = "full_container svelte-lrovuc";
    			add_location(div10, file, 106, 0, 3930);

    			dispose = [
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(input1, "keyup", ctx.validate_card),
    				listen(input2, "input", ctx.input2_input_handler),
    				listen(input3, "input", ctx.input3_input_handler),
    				listen(input4, "input", ctx.input4_input_handler),
    				listen(input5, "input", ctx.input5_input_handler)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div10, anchor);
    			append(div10, h1);
    			append(div10, t1);
    			append(div10, div9);
    			append(div9, div1);
    			append(div1, img0);
    			append(div1, t2);
    			append(div1, img1);
    			append(div1, t3);
    			append(div1, div0);
    			append(div0, label0);
    			append(label0, t4);
    			append(div0, t5);
    			append(div0, label1);
    			append(label1, t6);
    			append(label1, t7);
    			append(label1, t8);
    			append(label1, t9);
    			append(div0, t10);
    			append(div0, label2);
    			append(label2, t11);
    			append(div9, t12);
    			append(div9, div8);
    			append(div8, div2);
    			append(div2, img2);
    			append(div2, t13);
    			append(div2, h4);
    			append(div2, t15);
    			append(div2, input0);
    			append(div8, t16);
    			append(div8, form);
    			append(form, h30);
    			append(form, t18);
    			append(form, input1);

    			input1.value = ctx.numero_tarjeta;

    			append(form, t19);
    			append(form, h31);
    			append(form, t21);
    			append(form, input2);

    			input2.value = ctx.nombre;

    			append(form, t22);
    			append(form, div6);
    			append(div6, div4);
    			append(div4, div3);
    			append(div3, h32);
    			append(div3, t24);
    			append(div3, input3);

    			input3.value = ctx.mes_vencimiento;

    			append(div3, t25);
    			append(div3, input4);

    			input4.value = ctx.ano_vencimiento;

    			append(div6, t26);
    			append(div6, div5);
    			append(div5, h33);
    			append(div5, t28);
    			append(div5, input5);

    			input5.value = ctx.ccv;

    			append(form, t29);
    			append(form, div7);
    			append(div7, input6);
    		},

    		p: function update(changed, ctx) {
    			if (changed.src_card) {
    				img1.src = ctx.src_card;
    			}

    			if (changed.numero_tarjeta) {
    				set_data(t4, ctx.numero_tarjeta);
    			}

    			if (changed.mes_vencimiento) {
    				set_data(t7, ctx.mes_vencimiento);
    			}

    			if (changed.ano_vencimiento) {
    				set_data(t9, ctx.ano_vencimiento);
    			}

    			if (changed.nombre) {
    				set_data(t11, ctx.nombre);
    			}

    			if (changed.numero_tarjeta && (input1.value !== ctx.numero_tarjeta)) input1.value = ctx.numero_tarjeta;
    			if (changed.nombre && (input2.value !== ctx.nombre)) input2.value = ctx.nombre;
    			if (changed.mes_vencimiento && (input3.value !== ctx.mes_vencimiento)) input3.value = ctx.mes_vencimiento;
    			if (changed.ano_vencimiento && (input4.value !== ctx.ano_vencimiento)) input4.value = ctx.ano_vencimiento;
    			if (changed.ccv) input5.value = ctx.ccv;
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div10);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { numero_tarjeta, nombre, mes_vencimiento = '', ano_vencimiento = '', ccv, src_card = "./img/initcard.png", background_card = "nocard" } = $$props;
     
    	let validcard = false;
    	function validate_card(event)
    	{ 
    		validatorCard(numero_tarjeta, event.target);
    	} 
    	
    	function validatorCard(number, target) { 
    		$$invalidate('src_card', src_card = "./img/novalidcard.png");
    		validcard = false;

    		var cards = {
    			JCB: /^(?:2131|1800|35)[0-9]{0,}$/,
    			american_express: /^3[47][0-9]{0,}$/,
    			dinners_club: /^3(?:0[0-59]{1}|[689])[0-9]{0,}$/,
    			visa: /^4[0-9]{0,}$/,
    			master_card: /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)[0-9]{0,}$/,
    			maestro: /^(5[06789]|6)[0-9]{0,}$/
    		};
    		for (var card in cards) {
    			if (cards[card].test(number)) {
    				$$invalidate('src_card', src_card = "./img/" + card + ".png");
       
    				if	(card != '')
    				{ 
    					var color = card == 'nocard'? '#BFD7EA': card == 'JCB' ? '#49A833': card == 'american_express' ? '#AE9153':
    						card == 'dinners_club' ? '#869092': card == 'visa' ? '#60B7D6': card == 'master_card' ? '#F29B1E': '#0095D9';
    					document.getElementById("tarjeta").style.backgroundColor = color;  	
    					validcard = true;				
    				} else{
    					document.getElementById("tarjeta").style.backgroundColor = '#BFD7EA'; 
    				} 
    			}
    		} 
    	}  
    	 
    	window.onload = function() {
    		document.getElementById("mes_vencimiento").pattern = "^[0-9]*$"; 
    		document.getElementById("ano_vencimiento").pattern = "^[0-9]{4}$"; 
    		document.getElementById("numero_tarjeta").pattern = "^[0-9]{16}$"; 
    		document.getElementById("ccv").pattern = "^[0-9]{3}$"; 

    		document.getElementById("btnGuardar").onclick = function(){
    			var valid = document.getElementById("form_card").checkValidity();

    			if(valid){
    				if(!validcard){
    					swal("Verifique", "El número de tarjeta no es válido, verifique", "warning");
    					return false;
    				}
    				swal("Registro guardado", "Correcto", "success");
    				document.getElementById("guardado").style.visibility = "visible"; 
    				return false;
    			}
    		};
    	};

    	const writable_props = ['numero_tarjeta', 'nombre', 'mes_vencimiento', 'ano_vencimiento', 'ccv', 'src_card', 'background_card'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input1_input_handler() {
    		numero_tarjeta = this.value;
    		$$invalidate('numero_tarjeta', numero_tarjeta);
    	}

    	function input2_input_handler() {
    		nombre = this.value;
    		$$invalidate('nombre', nombre);
    	}

    	function input3_input_handler() {
    		mes_vencimiento = this.value;
    		$$invalidate('mes_vencimiento', mes_vencimiento);
    	}

    	function input4_input_handler() {
    		ano_vencimiento = this.value;
    		$$invalidate('ano_vencimiento', ano_vencimiento);
    	}

    	function input5_input_handler() {
    		ccv = this.value;
    		$$invalidate('ccv', ccv);
    	}

    	$$self.$set = $$props => {
    		if ('numero_tarjeta' in $$props) $$invalidate('numero_tarjeta', numero_tarjeta = $$props.numero_tarjeta);
    		if ('nombre' in $$props) $$invalidate('nombre', nombre = $$props.nombre);
    		if ('mes_vencimiento' in $$props) $$invalidate('mes_vencimiento', mes_vencimiento = $$props.mes_vencimiento);
    		if ('ano_vencimiento' in $$props) $$invalidate('ano_vencimiento', ano_vencimiento = $$props.ano_vencimiento);
    		if ('ccv' in $$props) $$invalidate('ccv', ccv = $$props.ccv);
    		if ('src_card' in $$props) $$invalidate('src_card', src_card = $$props.src_card);
    		if ('background_card' in $$props) $$invalidate('background_card', background_card = $$props.background_card);
    	};

    	return {
    		numero_tarjeta,
    		nombre,
    		mes_vencimiento,
    		ano_vencimiento,
    		ccv,
    		src_card,
    		background_card,
    		validate_card,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["numero_tarjeta", "nombre", "mes_vencimiento", "ano_vencimiento", "ccv", "src_card", "background_card"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.numero_tarjeta === undefined && !('numero_tarjeta' in props)) {
    			console.warn("<App> was created without expected prop 'numero_tarjeta'");
    		}
    		if (ctx.nombre === undefined && !('nombre' in props)) {
    			console.warn("<App> was created without expected prop 'nombre'");
    		}
    		if (ctx.ccv === undefined && !('ccv' in props)) {
    			console.warn("<App> was created without expected prop 'ccv'");
    		}
    	}

    	get numero_tarjeta() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set numero_tarjeta(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nombre() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nombre(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mes_vencimiento() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mes_vencimiento(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ano_vencimiento() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ano_vencimiento(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ccv() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ccv(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get src_card() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src_card(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get background_card() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set background_card(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		numero_tarjeta: "",
    		nombre: "",
    		fecha_vencimiento: "",
    		ccv: ""
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
