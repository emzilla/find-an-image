// Functions
// -----------------------

// Label functions for breakpoints
function showFullLabel() {
	if( $('.search-label span').hasClass('visuallyhidden')) {
		$('.search-label span').removeClass('visuallyhidden');
	}
}

function hideFullLabel() {
	$('.search-label span').addClass('visuallyhidden');
}

// Easter Egg Button
function flipIt() {
	$('#flip-it-button').on('click', function(){
		$('body').toggleClass('flipped');
	});
}

function hideFlipIt() {
	$('#flip-it-button').addClass('visuallyhidden');
}

function showFlipIt() {
	if( $('#flip-it-button').hasClass('visuallyhidden')) {
		$('#flip-it-button').removeClass('visuallyhidden');
	}
}


// Document Ready
// -----------------------

$(function() {

	flipIt();

	// Init enquire for responsive breakpoints
	// ------------------------------------------------

	// Breakpoints from stylesheet:
	var phone = '480px';
	var tablet = '800px';
	var desktop = '1200px';

	enquire.register('screen and (min-width: ' + tablet + ')', {
	    setup : function() {
	    	hideFullLabel();
	    },
	    match : function() {
	    	showFullLabel();
	    },
	    unmatch : function() {
	    	hideFullLabel();
	    }
	});

	enquire.register('screen and (min-width: ' + desktop + ')', {
	    setup : function() {
	    	hideFlipIt();
	    },
	    match : function() {
	    	showFlipIt();
	    },
	    unmatch : function() {
	    	hideFlipIt();
	    }
	});

	// Pull Images from Flickr and Filter on ajax call
	// ------------------------------------------------

	// Set up Flickr API Key and NASA User ID
	var apiKey = 'a5e95177da353f58113fd60296e1d250';
	var userId = '24662369@N07';

	var requestUrl = 'https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&api_key=' + apiKey + '&user_id=' + userId + '&format=json&nojsoncallback=1&per_page=21';

	$.ajax({
		type: 'GET',
		url: requestUrl,
		dataType: 'json',
		beforeSend: function() {
			// Set loader to display
			$('#loader').removeClass('visuallyhidden');
		},
		success: function(data) {
			// Remove loader visually when data loads
			$('#loader').addClass('visuallyhidden');

			// Create an knockout viewmodel to pass data parameter through
			var photosViewModel = function(flickrData) {
				var self = this;

				// Set array property
				self.photosArray = ko.observableArray([]);
				
				// Set viewmodel properties
				self.input = ko.observable("");

				// Filter array and display results of title search
				self.filteredList = ko.computed(function(){
					var filter = self.input();

					// If no filter display all photos in array, else return title that matches filter input
					if(!filter) {
						return self.photosArray();

					} else {
						return ko.utils.arrayFilter(self.photosArray(),function(singlePhoto) {
							return singlePhoto.title.toLowerCase().startsWith(filter.toLowerCase());
						});
					}
				});
				
				// Loop through flickrData and get data for each image
				for (i = 0; i < flickrData.length; i++) {

					// srcUrl url property parts
					var farmId = flickrData[i].farm;
					var server = flickrData[i].server;
					var photoId = flickrData[i].id;
					var photoSecret = flickrData[i].secret;
					var title = flickrData[i].title;

					// Create img src url
					var srcUrl = 'https://farm' + farmId + '.staticflickr.com/' + server + '/' + photoId + '_' + photoSecret + '_b.jpg';

					// Create nested viewmodel object to set image properties
					var singlePhotoViewModel = function(imgSrcParameter, titleParameter) {
						var self = this;
						self.imgSrc = imgSrcParameter;
						self.title = titleParameter;

					}

					// Push object data for single images to the photosArray property
					self.photosArray.push( new singlePhotoViewModel(srcUrl, title) );

				}
			}

			// Make it so!
			ko.applyBindings(new photosViewModel(data.photos.photo));

		},
		complete: function() {
			
		},
		error: function() {
			$('.photo-list').append('<li><p>Sorry, no images available at this time</p></li>');
		}
	});

});