javascript:(function () {
'use strict';
	var data = prompt('Paste the result JSON from the jenkins script...');

	var parsedData = JSON.parse(data);

	for (var key in parsedData) {
		if (!parsedData.hasOwnProperty(key)) { continue; }
		var dataValue = parsedData[key];
		var heading = $$("input[value='" + key + "']")[0];
		var inputOrSelect = heading.nextSibling;
		if (inputOrSelect.nodeType === 3) {
			inputOrSelect = inputOrSelect.nextSibling;
		}
		inputOrSelect.value = dataValue;
	}

})();void(0);