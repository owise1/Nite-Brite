$(function(){
	var t = new Twin;
	t.fetch_twins();
	t.refresh_images_on_change();
	
	$('#possible_images')
		.on('click', 'div.possible-image', function(){
			$('#main_img').html("<img src='"+$(this).data('url')+"' />");
			$(this).remove();
			$('#buttons').show();
		})
		.on('change', 'input[name=_attachments]', function(){
			if($(this).val() != ''){
				var me = $(this);
				t.db.saveDoc(t.twin_doc_base(), {
					success : function(response){
						if(response.ok){
							var data = {
								"_rev" : response.rev
							}
							$(":file",me).each(function() {
						    	data[this.name] = this.value; // file inputs need special handling
						  	});
							me.closest('form').ajaxSubmit({
								url : '/'+t.db_name+'/'+response.id,
								data : data,
								dataType : 'json',
								success : function(response){
									t.clear_showing();
									me.val('');
								}
							})
						}
					}
				})
			}
		})
	$('#container')
		.on('click', '#buttons button', function(){
			var me = $(this);
			if(t.admin){
				if($('div.existing-image.active').length > 0){
					var twin_doc = $('div.existing-image.active').data('doc');
				} else {
					var twin_doc = $.extend(t.twin_doc_base(), {
						img_src 	: $('#main_img img').attr('src')
					});
				}
				twin_doc.twin = t.config[$(this).attr('id')];
				t.db.saveDoc(twin_doc, {
					success : function(){
						$("#main_img").html('');
						$('div.existing-image').removeClass('active');
					}
				})
			}
		})
	$('#existing')
		.on('click', 'a.delete', function(e){
			e.stopPropagation();
			var div = $(this).closest('div.existing-image');
			t.db.removeDoc(div.data('doc'));
			div.remove();
		})
		.on('click', 'div.existing-image', function(){
			if($(this).data('doc').twin) return;
			$('div.existing-image').removeClass('active');
			$(this).addClass('active');
		})
		
	
	
	$('input[name=search_twitter]').click(function(){
		if($('input[name=screen_name]').val() !=''){
			$.ajax({
				url : 'http://api.twitter.com/1/statuses/user_timeline.json?count=50&include_entities=true&screen_name=' + $('input[name=screen_name]').val(),
				dataType : 'jsonp',
				success :  function(response){
					var images = '';
					$.each(response, function(i, tweet){
						if(tweet.entities.media){
							console.log(tweet);
							var url = tweet.entities.media[0].media_url;
							$('#possible_images').append($("<div class='possible-image thumb pointer'>").html("<img src='"+url+"' width=100 />").data('url', url))
						}
					})
				}
			})
		}
	})
	
	moveScroller();
})
