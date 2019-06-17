<script>   
	export let numero_tarjeta;
	export let nombre;
	export let mes_vencimiento = '';
	export let ano_vencimiento = '';
	export let ccv;
	export let src_card = "./img/initcard.png";
	export let background_card = "nocard";
 
	let validcard = false;
	function validate_card(event)
	{ 
		validatorCard(numero_tarjeta, event.target);
	} 
	
	function validatorCard(number, target) { 
		src_card = "./img/novalidcard.png";
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
				src_card = "./img/" + card + ".png";
   
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
		}
	}; 

</script>

<style>
	h1 {
		color:#256BB1;
	}
	.full_container {
		background-color: #F2F2F2; margin: 10px 10px 10px 10px; padding:  10px 15px 10px 15px; position:relative;
	}  
	.container
	{
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  		grid-template-rows: 1fr; grid-column-gap: 10px; grid-row-gap: 10px;
	}
	.card{
		width:100%; background-color: #BFD7EA; height:100%; height: 280px;
		min-width:250px; max-height:450px; max-width:500px;
		border-radius: 20px 20px 20px 20px;
		-moz-border-radius: 20px 20px 20px 20px;
		-webkit-border-radius: 20px 20px 20px 20px;
		border: 0px solid #000000;
	} 
	.data_card{position:relative;}
	.text_field { width:100%; }

	.chip_image{ height:80px; width:130px; position: relative; left:10%; margin-top:5%; }
	.card_image { height:80px; width:130px; position: relative; left:30%; margin-top:5%; } 

	.container_data_card{position: absolute; margin-top:1.5em; margin-left:3em; } 
	.numero_tarjeta{font-family: Verdana, Geneva, Tahoma, sans-serif; font-size:2em;}
	.valido_hasta{font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size:1em; margin-top: 1em; margin-left: 3em;}
	.nombre_tarjetahabiente{font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size:1.5em; margin-top: 1em;}
	.boton_agregar{width:100%; background-color: #88C445; color:white; cursor: pointer; margin-top:0.5em; }
	
	.guardado{ background-color:white; left:0; top:0; width:100%; height:100%; visibility:hidden; position:absolute; z-index:10; }
	.titulo_agregado{text-align:center; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 1.8em; padding-left: auto;
		  padding-right: auto; padding-top: 0%; font-weight:normal; position:relative; }
	.img_check{position:relative; height:10em; width:10em; margin-top:1em;  margin-left: auto; margin-right: auto; display: block; }
</style> 
 
<div class="full_container"> 
	<h1>Nuevo método de pago </h1> 
	<div class="container">
		<div class="card nocard" id="tarjeta">				 
			<img src="./img/chip.png" alt="chip_image" class="chip_image"> 
			<img src={src_card} alt="card_image" class="card_image">

			<div class="container_data_card">
				<label class="numero_tarjeta">{numero_tarjeta}</label>
				<label class="valido_hasta">Válido hasta: {mes_vencimiento} / {ano_vencimiento}</label>
				<label class="nombre_tarjetahabiente">{nombre}</label>
			</div>
			
		</div>
		<div class="data_card">
			<div id="guardado" class="guardado">  
				<img class="img_check" src="./img/check.png" alt="check_image"/>
				<h4 class="titulo_agregado">El método de pago fue agregado correctamente</h4>
				<input type="button" class="boton_agregar" value="Registrar otra tarjeta" onclick="window.location.reload(true);">
			</div>

			<form id="form_card"> 
				<h3>Número de la tarjeta</h3>
				<input type="text" id="numero_tarjeta" name="numero_tarjeta" maxlength="16" bind:value="{numero_tarjeta}" on:keyup="{validate_card}" 
					placeholder="Número de tarjeta" onkeypress="if ( isNaN( String.fromCharCode(event.keyCode) )) return false;" class="text_field" required/> 

				<h3>Nombre del tarjetahabiente</h3>
				<input type="text"  bind:value={nombre}  name="nombre_completo" maxlength="30" placeholder="Nombre completo" 
					class="text_field" required/>
			 
				<div class="container">
					<div>  
						<div>
							<h3>Fecha de Vencimiento </h3>
							<input type="text" id="mes_vencimiento" bind:value="{mes_vencimiento}" maxlength="2" placeholder="Mes" 
								style="width:40%" onkeypress="if ( isNaN( String.fromCharCode(event.keyCode) )) return false;" required/>
							<input type="text" id="ano_vencimiento" bind:value="{ano_vencimiento}" maxlength="4" placeholder="Año" 
								style="width:40%" onkeypress="if ( isNaN( String.fromCharCode(event.keyCode) )) return false;" required/>
						</div>  
					</div>
					<div>
						<h3>Código CCV</h3>
						<input type="password" id="ccv" bind:value="{ccv}" maxlength="3" placeholder="CCV" 
							onkeypress="if ( isNaN( String.fromCharCode(event.keyCode) )) return false;" required/>
					</div>
				</div>
				<div>
					<input type="submit" class="boton_agregar" id="btnGuardar" value="Agregar método de pago" />
				</div>
			</form>
			
		</div>
	</div>
	
</div>
