function(doc) {	
	if(doc.type == "pixel"){
		emit(doc._id.split('-')[1], null);
	}
};