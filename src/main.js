import App from './App.svelte'; 

const app = new App({
	target: document.body,
	props: {
		numero_tarjeta: "",
		nombre: "",
		fecha_vencimiento: "",
		ccv: ""
	}
});

export default app;