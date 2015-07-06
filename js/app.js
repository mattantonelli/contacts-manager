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
			name:    "",
			address: "",
			tel:     "",
			email:   "",
			type:    "",
			photo:   "img/placeholder.png"
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
		editTemplate: _.template($("#contactEditTemplate").html()),

		render: function () {
			var tmpl = _.template(this.template);

			this.$el.html(tmpl(this.model.toJSON()));
			return this;
		},

		events: {
			"click button.delete": "deleteContact",
			"click button.edit": "editContact",
			"change select.type": "addType",
			"click button.save": "saveEdits",
			"click button.cancel": "cancelEdit"
		},

		editContact: function() {
			this.$el.html(this.editTemplate(this.model.toJSON()));

			var newOpt = $("<option/>", {
				html: "<em>Add new...</em>",
				value: "addType"
			});

			this.select = directory.createSelect().addClass("type")
				.val(this.$el.find("#type").val()).append(newOpt)
				.insertAfter(this.$el.find(".name"));

			this.$el.find("input[type='hidden']").remove();
		},

		saveEdits: function (e) {
			e.preventDefault();

			var formData = {},
			    prev = this.model.previousAttributes;

			 $(e.target).closest("form").find(":input").not("button")
			 	.each(function () {
			 		var el = $(this);
			 		formData[el.attr("class")] = el.val();
			 });

			 if (formData.photo === "") {
			 	delete formData.photo;
			 }

			 this.model.set(formData);
			 this.render();

			 if (prev.photo === "img/placeholder.png") {
			 	delete prev.photo;
			 }

			 _.each(contacts, function (contact) {
			 	if (_.isEqual(contact, prev)) {
			 		contacts.splice(_.indexOf(contacts, contact), 1, formData);
			 	}
			 });
		},

		cancelEdit: function () {
			this.render();
		},

		deleteContact: function () {
			var removedType = this.model.get("type").toLowerCase();

			this.model.destroy();
			this.remove();

			if (_.indexOf(directory.getTypes(), removedType) === -1) {
				directory.$el.find("#filter select")
					.children("[value='" + removedType + "']").remove();
			}
		},

		addType: function() {
			if (this.select.val() === "addType") {
				this.select.remove();

				$("<input />", {
					"class": "type"
				}).insertAfter(this.$el.find(".name")).focus();
			}
		}
	});

	// define master view
	var DirectoryView = Backbone.View.extend({
		el: $("#contacts"),

		initialize: function () {
			this.collection = new Directory(contacts);
			this.render();

			this.$el.find("#filter").append(this.createSelect());
			this.on("change:filterType", this.filterByType, this);

			this.collection.on("reset", this.render, this);
			this.collection.on("add", this.renderContact, this);
			this.collection.on("remove", this.removeContact, this);
		},

		render: function () {
			this.$el.find("article").remove();

			_.each(this.collection.models, function (item) {
				this.renderContact(item);
			}, this);
		},

		renderContact: function (item) {
			var contactView = new ContactView({
				model: item
			});
			this.$el.append(contactView.render().el);
		},

		getTypes: function () {
			return _.uniq(this.collection.pluck("type"), false, function (type) {
				return type.toLowerCase();
			});
		},

		createSelect: function () {
			var select = $("<select/>", {
					html: '<option value="all">all</option>'
				});

			_.each(this.getTypes(), function (item) {
				var option = $("<option/>", {
					value: item.toLowerCase(),
					text: item.toLowerCase()
				}).appendTo(select);
			});

			return select;
		},

		events: {
			"change #filter select": "setFilter",
			"click #add": "addContact",
			"click #showForm": "showForm"
		},

		setFilter: function (e) {
			this.filterType = e.currentTarget.value;
			this.trigger("change:filterType");
		},

		filterByType: function () {
			if (this.filterType === "all") {
				this.collection.reset(contacts);
				contactsRouter.navigate("filter/all");
			} else {
				this.collection.reset(contacts, { silent: true });

				var filterType = this.filterType,
					filtered = _.filter(this.collection.models, function (item) {
						return item.get("type").toLowerCase() === filterType;
					});

				this.collection.reset(filtered);
				contactsRouter.navigate("filter/" + filterType);
			}
		},

		addContact: function (e) {
			e.preventDefault();
			this.collection.reset(contacts, { silent: true });

			var newModel = {};
			$("#addContact").children("input").each(function (i, el) {
				if ($(el).val() !== "") {
					newModel[el.id] = $(el).val();
				}
			});

			contacts.push(newModel);
			this.collection.add(new Contact(newModel));

			if (_.indexOf(this.getTypes(), newModel.type) === -1) {
				this.$el.find("#filter").find("select").remove().end()
					.append(this.createSelect());
			}
		},

		removeContact: function (removedModel) {
			var removed = removedModel.attributes;

			if (removed.photo === "img/placeholder.png") {
				delete removed.photo;
			}

			_.each(contacts, function(contact) {
				if (_.isEqual(contact, removed)) {
					contacts.splice(_.indexOf(contacts, contact), 1);
				}
			});
		},

		showForm: function() {
			this.$el.find("#addContact").slideToggle();
		}
	});

	// routes
	var ContactsRouter = Backbone.Router.extend({
		routes: {
			"filter/:type": "urlFilter"
		},

		urlFilter: function (type) {
			directory.filterType = type;
			directory.trigger("change:filterType");
		}
	});

	// create instance of master view
	var directory = new DirectoryView();

	// create an instance of the contacts router
	var contactsRouter = new ContactsRouter();
	Backbone.history.start();
} (jQuery));