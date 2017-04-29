$(document).ready(function () {

	$("#topic1").hide();
	$("#topic2").hide();


	$("#btn2").click(function(){
		$("#topic1").fadeToggle();
		$("#topic2").fadeToggle();
	});
	
	$("#textBox").on('click', function(){

		$("#textBox").val(''); // reseting it to empty
	});
 });