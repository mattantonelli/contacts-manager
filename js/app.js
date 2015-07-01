(function ($) {

	// demo data
	var contacts = [
		{ name: "Rob Lowe", address: "123 Hollywood Blvd,<br />Los Angeles, CA 90028", tel: "123-456-7890", email: "rob@lowe.com", type: "family" },
		{ name: "Chad Lowe", address: "123 Hollywood Blvd,<br />Los Angeles, CA 90028", tel: "123-456-7890", email: "chad@lowe.com", type: "family" },
		{ name: "Mark Wahlberg", address: "123 Hollywood Blvd,<br />Los Angeles, CA 90028", tel: "123-456-7890", email: "mark@wahlberg.com", type: "friend" },
		{ name: "George Clooney", address: "123 Hollywood Blvd,<br />Los Angeles, CA 90028", tel: "123-456-7890", email: "george@clooney.com", type: "colleague" },
		{ name: "Robert Downey Jr.", address: "123 Hollywood Blvd,<br />Los Angeles, CA 90028", tel: "123-456-7890", email: "robert@downey.com", type: "family" },
		{ name: "Michael J Fox", address: "123 Hollywood Blvd,<br />Los Angeles, CA 90028", tel: "123-456-7890", email: "michael@fox.com", type: "colleague" },
		{ name: "Jason Statham", address: "123 Hollywood Blvd,<br />Los Angeles, CA 90028", tel: "123-456-7890", email: "jason@statham.com", type: "friend" },
		{ name: "Brad Pitt", address: "123 Hollywood Blvd,<br />Los Angeles, CA 90028", tel: "123-456-7890", email: "brad@pitt.com", type: "family" }
	];

	// define contact model
	var Contact = Backbone.Model.extend({
		defaults: {
			photo: "img/placeholder.png"
		}
	});

	// define directory collection
	var Directory = Backbone.Collection.extend({
		model: Contact
	});

	// define individual contact view
	var ContactView = Backbone.View.extend({
		tagName: "article",
		className: "contact-container",
		template: $("#contactTemplate").html(),

		render: function () {
			var tmpl = _.template(this.template);

			this.$el.html(tmpl(this.model.toJSON()));
			return this;
		}
	});

	// define master view
	var DirectoryView = Backbone.View.extend({
		el: $("#contacts"),

		initialize: function () {
			this.collection = new Directory(contacts);
			this.render();
		},

		render: function () {
			var that = this;
			_.each(this.collection.models, function (item) {
				that.renderContact(item);
			}, this);
		},

		renderContact: function (item) {
			var contactView = new ContactView({
				model: item
			});
			this.$el.append(contactView.render().el);
		}
	});

	// create instance of master view
	var directory = new DirectoryView();
} (jQuery));