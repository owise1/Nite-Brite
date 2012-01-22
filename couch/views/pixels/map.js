function(doc) {	
	if(doc.type == "pixel"){
		splitted = doc._id.split(',');
		if(splitted[5]) // timestamp
			emit(splitted[5], null);
	}
};