 

# svelte app - Registro de medio de pago 

Ejercicio / reto para RetoCoderosJunio2019

## Validación
Ya que Svelte reconoce las llaves '{}' para el 'bindeo' de las propiedades y no pueden ser usadas para definir una expresión regular directamente sobre el html: desde js se agregan las propiedades pattern para la validación de números. Se hace uso del api de HTML5 de validación para verificar el formulario.

## Librerias externas
Se hace uso de SweetAlert para enviar mensajes al usuario

## Tarjetas y números válidos
  
JCB ^(?:2131|1800|35)[0-9]{0,}$ Inicia con: 2131, 1800, 35 (3528-3589)

American Express ^3[47][0-9]{0,}$ Inicia con: 34, 37

Diners Club ^3(?:0[0-59]{1}|[689])[0-9]{0,}$ Inicia con: 300-305, 309, 36, 38-39

Visa ^4[0-9]{0,}$ Inicia con: 4

MasterCard ^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)[0-9]{0,}$ Inicia con: 2221-2720, 51-55

Maestro ^(5[06789]|6)[0-9]{0,}$ Rango de 60-69 y desde 56
