// Use Logger instead of console, as it's not guarenteed to work in all browsers...
var Logger = {
	log: function(str) {
		if (console && console.log) {
			console.log(str);
		}
	}
}

var CopyContents = {
	ready: function(event) {
		$("[data-role*=\"copy-contents\"]").on("click.copyElement", CopyContents.click);
	},
	click: function(event) {
		var $this = $(this),
			$source = $($this.data("source-selector")),
			$target = $($this.data("target-selector"));

		if ($source.length == 0) {
			// Logger.log("CopyContents Error: data-source-selector could not find an element..");
			return false;
		} else if ($target.length == 0) {
			// Logger.log("CopyContents Error: data-target-selector could not find an element..");
			return false;
		}

		// TODO don't copy hidden rails elements
		var $clone = $source.children().clone().appendTo($target);

		$clone.find("[name]").attr("name", $.proxy(CopyContents._changeNameCount, null, $target));
	},
	_changeNameCount: function($target) {
		// TODO get actual count
		// Logger.log($target.children("div").length);
		// Logger.log("This: " + $(this).attr("name"));
		return $(this).attr("name").replace("[0]", "[" + $target.children($target.children("[data-role*=model-template]")).length + "]")
	}
}

// TODO This will only work for one menu, refactor to allow new ToggleMenu and the ready function should loop through $("[data-role*=menu-toggle]")
var ToggleMenu = {
	_dataRole: "toggle-menu",
	_clickEvent: "toggleMenuClick",
	_hideMenuEvent: "hideMenuClick",
	_window: null,
	_document: null,
	_menu: null,
	_target: null,
	ready: function(event) {
		var $menu = $("[data-role*=" + ToggleMenu._dataRole + "]"),
			$target = $($menu.data("target"));

		if ($target.length) {
			ToggleMenu._window = $(window);
			ToggleMenu._document = $(document);
			ToggleMenu._menu = $menu;
			ToggleMenu._target = $target;

			$menu.on("click." + ToggleMenu._clickEvent, ToggleMenu.click);
			$target.addClass("toggle-menu");
		}
	},
	click: function(event) {
		ToggleMenu._window.on("click." + ToggleMenu._hideMenuEvent, ToggleMenu.docHideMenu);
		ToggleMenu._target.show();

		event.stopPropagation();
		event.preventDefault();
	},
	docHideMenu: function(event) {
		if (!$.contains(ToggleMenu._target, event.target)) {
			ToggleMenu._target.hide();
			ToggleMenu._window.off("click." + ToggleMenu._hideMenuEvent);
		}
	}
};

var ToggleEdit = {
	ready: function(event) {
		$(document).on("click.toggleEditClick", "[data-role*=toggle-edit], [data-role*=toggle-save]", function(event) {
			event.stopPropagation();
			event.preventDefault();

			var $this = $(this),
				$editable = $this.closest("[data-role*=editable]"),
				$show = $editable.find(".show"),
				$edit = $editable.find(".edit");

			if ($show.is(":visible")) {
				$show.hide();
				$edit.show();
			} else {
				$show.show();
				$edit.hide();
			}
		});
	}
};

ModalWindow = {
	ready: function(event, $document) {
		console.log("ModalWindow");

		var $overlay = ModalWindow.findOverlay();
		var $modal = ModalWindow.findModal();

		$document.on("click.open-modal", "[data-role*=modal]", ModalWindow.open);
	},
	open: function(event) {
		var $link = $(event.target),
				$overlay = ModalWindow.findOverlay(),
				$modal = ModalWindow.findModal();

		var href = $link.data("href"),
				$container = $($link.data("container"));

		if (href) {
			// show loading screen
			// make a promise, ajax call
			// ajax call contents to modal
			// hide loading screen
		} else if ($container.length) {
			$modal.find("#satori-modal-title").text($link.data("title"));
			$modal.find("#satori-modal-content").html($container.html());
		} else {
			Logger.log("Warning: No modal window content found.");
		}

		$overlay.show();
		$modal.show();

		ModalWindow.resize($modal);
	},
	close: function(event) {
		var $overlay = ModalWindow.findOverlay(),
				$modal = ModalWindow.findModal();

		$overlay.hide();
		$modal.hide();
	},
	resize: function ($modal) {
		var $window = $(window);

		console.log($window.scrollTop());
		console.log($window.height());

		$modal.css({
			top: ($window.scrollTop() + ($window.height() / 10)),
			left: $window.width() / 10
		});
	},
	findOverlay: function() {
		var $overlay = $("#satori-overlay");

		if ($overlay.length === 0) {
			$overlay = $("<div id=\"satori-overlay\">");

			$overlay.appendTo(document.body);
			$overlay.on("click.close-modal", ModalWindow.close);
		}

		return $overlay;
	},
	findModal: function() {
		var $modal = $("#satori-modal");

		if ($modal.length === 0) {
			$modal = $("<div id=\"satori-modal\">");

			var $toolbar = $("<header id=\"satori-modal-top-toolbar\" class=\"bg-primary\"><div id=\"satori-modal-title\"></div></header>"),
					$btnClose = $("<div id=\"satori-modal-close\" class=\"right fake-link mobile-icon close no-text no-margin\">Close</div>"),
					$content = $("<div id=\"satori-modal-content\">");

			$btnClose.on("click.close-modal", ModalWindow.close).prependTo($toolbar);

			$toolbar.appendTo($modal);
			$content.appendTo($modal);

			$modal.appendTo(document.body);
		}

		return $modal;
	}
};

var $document = $(document);

$document.on("page:load ready", function(event) {
	console.log("Satori!");

	ModalWindow.ready(event, $document);

	CopyContents.ready(event);
	ToggleMenu.ready(event);
	ToggleEdit.ready(event);

	$(".secondary-nav ul").each(function(i, ul) {
		var $ul = $(ul),
				$nav = $ul.closest(".secondary-nav"),
				$parent = $ul.parent(),
				boundary = $nav.width()
				visible = true;

		$ul.children("li").each(function(j, li) {
			var $li = $(li),
					position = $li.position().top;

			if (position == 0) {
				// li is visible
			} else {
				visible = false;
			}
		});

		if (!visible) {
			var $left = $("<div class=\"arrow dir-left\" />"),
					$right = $("<div class=\"arrow dir-right\" />");

			$right.on("click.scrollRight", function(event) {
				var $nav = $(this).closest(".secondary-nav"),
						$ul = $nav.children("ul"),
						$arrows = $nav.find(".arrow");

				$nav.scrollTop($nav.scrollTop() + $nav.height());
				$arrows.css("top", $nav.scrollTop());
			});

			$left.on("click.scrollLeft", function(event) {
				// TODO make this a function, it's a copy of right, just - instead of +
				var $nav = $(this).closest(".secondary-nav"),
						$ul = $nav.children("ul"),
						$arrows = $nav.find(".arrow");

				$nav.scrollTop($nav.scrollTop() - $nav.height());
				$arrows.css("top", $nav.scrollTop());
			});

			$left.prependTo($parent);
			$right.appendTo($parent);
		}
	});

    $document.on("click.delete-model", "[data-role*=delete-model]", function(event) {
        var $this = $(this),
            $closest = $this.closest("[data-role*=model-template]");

        if (confirm("Are you sure you want to delete this?")) {
            $closest.hide();
            $closest.find("[required]").removeAttr("required");
            $closest.find("[name*='_destroy'][value='false']").val("1");
            event.preventDefault();
        }

        // there's a bug here that binds the event twice
        event.stopPropagation();
    });

	// start toggle
	$document.on("change.toggle-object", "[data-role*=select-tog]", function(event) {
		var $select = $(this),
			selector = $select.data("toggle-selector"),
			selectorValue = $select.find("option:selected").data("option-value"),
			container = $select.data("toggle-container") || document,
			$container = $(container),
			$names = $container.find("[data-toggle-name*=" + selector + "]");

		$names.find("[data-toggle-value]").each(function(i, obj) {
			var $obj = $(obj),
				value = $obj.data("toggle-value");

			if (obj !== undefined) {
				values = value.split(",");

				if ($.inArray(selectorValue, values) != -1) {
					$obj.show();
				} else {
					$obj.hide();
				}
			}
		});
	});
	$("[data-role*=select-tog]").trigger("change.toggle-object");
	// end toggle
})
