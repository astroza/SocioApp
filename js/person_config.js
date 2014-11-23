function open_person_dialog() {
	$('#person_name').val(localStorage.getItem('person_name'));
	$('#person_status').val(localStorage.getItem('person_status'));
	$( "#popupPerson" ).popup("open");
}

function save_person_data() {
	localStorage.setItem('person_name', $('#person_name').val());
	localStorage.setItem('person_status', $('#person_status').val());
	$("#popupPerson").popup("close");
}

(function() {
	if(localStorage.getItem('person_name') == undefined)
		localStorage.setItem('person_name', 'Newbie');
	if(localStorage.getItem('person_status') == undefined)
		localStorage.setItem('person_status', ':)');
})();