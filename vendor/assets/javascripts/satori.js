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
			Logger.log("CopyContents Error: data-source-selector could not find an element..");
			return false;
		} else if ($target.length == 0) {
			Logger.log("CopyContents Error: data-target-selector could not find an element..");
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

var Tooltip = {
	ready: function(event, $document) {
		var $tooltip = $("#satori-tooltip");

		if ($tooltip.length == 0) {
			$tooltip = $("<div id=\"satori-tooltip\">").addClass("tooltip").appendTo(document.body);
		}

		$document.on("click.toggleTooltip", "[data-role*=tooltip]", Tooltip.open);
		$document.on("keyup.closeTooltip", function(event) {
			if (event.keyCode == 27) {
				Tooltip.close(event);
			}
		});

		$("[data-role*=tooltip]").addClass("tooltip-icon");
	},
	open: function(event) {
		var $this = $(this),
				$tooltip = $("#satori-tooltip"),
				header = $this.data("title")
				content = $this.data("content");

		if (content) {
			var $header = $("<header>"),
					$content = $("<p>");

			if (header) {
				$header.html(header)
			}

			if (content) {
				$content.html(content);
			}

			$tooltip.empty().append($header).append($content);
		} else {
			$tooltip.html($this.html());
		}

		$tooltip.show();

		$tooltip.css({
			top: $this.offset().top + $this.width() + "px",
			left: $this.offset().left + "px"
		});

		$document.on("click.closeTooltip", Tooltip.close);
	},
	close: function(event) {
		var $this = $(this),
				$tooltip = $("#satori-tooltip");

		if (!$.contains($tooltip[0], event.target)) {
			$tooltip.hide();

			$document.off("click.closeTooltip");
		}
	}
};

var ModalWindow = {
	ready: function(event, $document) {
		var $overlay = ModalWindow.findOverlay(),
				$modal = ModalWindow.findModal();

		$document.on("click.open-modal", "[data-role*=modal]", ModalWindow.open);
		$document.on("keyup.close-modal", function(event) {
			if (event.keyCode == 27) {
				ModalWindow.close(event);
			}
		});
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

		$modal.css({
			top: ($window.scrollTop() + ($window.height() / 10)),
			left: "calc(50% - " + ($modal.width() / 2) + "px)"
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

			var $toolbar = $("<header><div id=\"satori-modal-title\"></div></header>"),
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


// TODO Make this an object instead of a variable
var Slideshow = {
	ready: function(event) {
		var $document = $(document);

		$("[data-role*=slideshow]").each(function(i, slideshow) {
			var $slideshow = $(slideshow),
					defaults = {
						timer: 0,
						visibleSlides: 1,
						step: 1,
						loop: false,
						bindKeyEvents: true,
						showArrows: true,
						showControls: false,
						hightlightActive: false
					},
					options = $.extend({}, defaults, $slideshow.data());

			Slideshow.init(null, $slideshow, options);
		});
	},
	init: function(event, $slideshow, options) {
		var timer = null;

		if (options.timer > 0) {
			timer = window.setInterval(function() {
				Slideshow.scroll($slideshow, options, "right");
			}, options.timer);
		}

		// keyboard scrolling
		if (options.bindKeyEvents === true) {
			$document.on("keyup.slideshowScroll", function(event) {
				if (event.keyCode == 37) {
					window.clearInterval(timer);
					Slideshow.scroll($slideshow, options, "left");
				} else if (event.keyCode == 39) {
					window.clearInterval(timer);
					Slideshow.scroll($slideshow, options, "right");
				} else if (event.keyCode == 27) {
					window.clearInterval(timer);
				}
			});
		}

		Slideshow.initialHide($slideshow, options);
		Slideshow.showActive($slideshow, options);

		// TODO Create Arrows
		// TODO Create Controls
	},
	initialHide: function($slideshow, options) {
		var $slides = $slideshow.find("[data-role*=slide]");

		$slides.slice(options.visibleSlides, $slides.length).hide();

		// TODO If highlightActive, then scroll to first slide instead of middle slide
	},
	showActive: function($slideshow, options) {
		if (options.hightlightActive == true) {
			var $slides = $slideshow.find("[data-role*=slide]"),
					$visible = $slides.filter(":visible");

			$slides.removeClass("inactive active");
			$visible.slice(0, options.visibleSlides).addClass("inactive");
			$visible.filter(":eq(" + Math.floor((options.visibleSlides - 1) / 2) + ")").addClass("active").removeClass("inactive");
		}
	},
	getNext: function($slides, options, direction) {
		var $visible = $slides.filter(":visible"),
				$next = [];

		if (direction == "left") {
			$next = $visible.eq(-options.step).prevAll(":lt(" + options.visibleSlides + ")")

			if (options.loop == true) {
				var $move = $slides.not(":visible"),
						$slideshow = $slides.closest("[data-role*=slideshow]");

				$move.prependTo($slideshow);

				// update slides and visible from DOM.
				$slides = $slideshow.find("[data-role*=slide]");

				$next = $slides.eq(-options.step).prevAll(":lt(" + options.visibleSlides + ")");

				// this moves elements around to stay consistent with forward
				var $prev = $next.last().prevAll(),
						$reverse = $($prev.get().reverse());

				$reverse.appendTo($slideshow);
			} else if ($next.length < options.visibleSlides) {
				// this is a hack to get the first n slides
				$next = $slides.slice(0, options.visibleSlides);
			}
		} else if (direction == "right") {
			$next = $visible.eq(-1 + options.step).nextAll(":lt(" + options.visibleSlides + ")");

			if (options.loop == true) {
				var $move = $visible.first().prevAll();

				$move.appendTo($slides.closest("[data-role*=slideshow]"));
				$next = $visible.eq(-1 + options.step).nextAll(":lt(" + options.visibleSlides + ")");
			} else if ($next.length < options.visibleSlides) {
				// this is a hack to get the last n slies
				$next = $slides.slice(-options.visibleSlides);
			}
		} else {
			Logger.log("Invalid direction: Choose either \"left\" or \"right.\"");
		}

		return $next;
	},
	scroll: function($slideshow, options, direction) {
		// if loop, move all invisible slides to front or back
		var $slides = $slideshow.find("[data-role*=slide]");

		if (direction == "left") {
			var $next = Slideshow.getNext($slides, options, direction);

			if ($next.length >= options.visibleSlides) {
				$slides.hide();
				$next.show();

				if (options.loop == true) {
					$next.first().prevAll(":not(:visible)").appendTo($next.closest("[data-role*=slideshow]"));
				}
			}
		} else if (direction == "right") {
			var $next = Slideshow.getNext($slides, options, direction);

			if ($next.length >= options.visibleSlides) {
					$slides.hide();
					$next.show();

					if (options.loop == true) {
						$next.first().prevAll(":not(:visible)").appendTo($next.closest("[data-role*=slideshow]"));
					}
			}
		} else {
			Logger.log("Invalid direction: Choose either \"left\" or \"right.\"");
		}

		Slideshow.showActive($slides.closest("[data-role*=slideshow]"), options);
	}
}

var Tabs = {
	ready: function(event, $document) {
		$document.on("click.activateTab", "[data-role*=tabs] nav li", Tabs.click);

		$document.find("[data-role*=tabs]").each(function(i, obj) {
			var	$container = $(obj),
					$tabs = $container.find("nav li"),
					initial = $container.data("initial"),
					$active = null,
					$target = null;

			if (typeof initial == "number") {
				$active = $tabs.filter(":eq(" + (initial-1) + ")");
			} else {
				$active = $tabs.filter("[data-target=" + initial + "]");
			}

			if ($active.length) {
				$target = $active;
			} else if ($tabs.first().length) {
				$target = $tabs.first();
			}

			if ($target.length) {
				$target.trigger("click.activateTab")
			} else {
				Logger.log("Cannot find an active or first tab.");
			}
		});
	},
	click: function(event) {
		var $this = $(this),
				target = $this.data("target")
				$container = $this.closest("[data-role*=tabs]"),
				$tabs = $container.find("nav  li"),
				$sections = $container.children("section"),
				$target = $sections.filter(target);

		if ($target.length) {
			$tabs.removeClass("active")
			$tabs.filter($this[0]).addClass("active");

			$sections.hide();
			$target.show();
		} else if ($tabs.length === $sections.length) {
			$tabs.removeClass("active")
			$tabs.filter($this[0]).addClass("active");

			$sections.hide();
			$sections.filter($sections[$tabs.filter($this[0]).index()]).show();
		} else {
			Logger.log("The tab has no target section.");
		}
	}
}

var DropdownMenu = {
	spacing: 10,
	ready: function(event, $doc) {
		$doc.off("click.show-menu").on("click.show-menu", "[data-role=menu]", DropdownMenu.show);

		$("[data-role=menu]").each(function(i, obj) {
			var $menu = $(obj),
					$target = $($menu.data("menu-target"));

			$target.hide().appendTo(document.body);
			$target.attr("data-role", "menu-body");

			// TODO Add override class option
			$target.addClass("dropdown-menu vertical-nav");
		});
	},
	show: function(event) {
		var $this = $(this),
				$window = $(window),
				$document = $(document),
				$target = $($this.data("menu-target")),
				top = $this.offset().top + $this.height() + DropdownMenu.spacing;

		if ($target.length < 1) {
			Logger.log("The menu has no menu-target.");
		}

		if ($this.data("menu-fixed") === true) {
			$target.css("position", "fixed");
			top = top - $window.scrollTop();
		}

		$target.css({
			top: top + "px",
			left: $this.offset().left + "px"
		});

		$target.show();
		$document.on("click.hide-menu", DropdownMenu.hide);
		event.preventDefault();
	},
	hide: function(event) {
		var $document = $(document),
				$target = $(event.targetElement),
				$bodies = $("[data-role=menu-body]");

		$bodies.each(function(i, obj) {
			var $obj = $(obj);

			if (!$.contains(obj, event.target) && $obj.is(":visible")) {
				$obj.hide();

				$document.off("click.hide-menu");
			}
		});
	}
}

var ResponsiveTables = {
	ready: function(event, $doc) {
		var $tables = $doc.find("table").not("[data-responsive=false]");

		// columns, data-responsive-column=[essential, optional, hidden]
		// essential = visible, checkbox cannot hide it
		// optional = visible, checkbox can hide it (default)
		// hidden = hidden, checkbox can show it

		$tables.each(function(i, table) {
			var $table = $(table),
					$header = $("<div class=\"responsive-table-header\"></div>"),
					$menuBody = $("<nav id=\"responsive-table-" + i + "\" class=\"nowrap\"></nav>"),
					$list = $("<ul>").appendTo($menuBody),
					$button = $("<span class=\"button right\" data-role=\"menu\" data-menu-target=\"#responsive-table-" + i + "\">Options</span>"),
					$headers = $table.find("thead tr:first th"),
					$essential = $headers.filter("[data-responsive-column=essential]"),
					$optional = $headers.filter("[data-responsive-column=optional], :not([data-responsive-column])"),
					$hidden = $headers.filter("[data-responsive-column=hidden]"),
					$rows = $table.find("tbody tr");

			console.log(table);
			console.log("Headers:" + $headers.length),
			console.log("Essential: " + $essential.length);
			console.log("Optional (default): " + $optional.length);
			console.log("Hidden: " + $hidden.length);

			$headers.each(function(j, th) {
				var $th = $(th)
						type = $th.data("responsive-column") || "optional",
						$listItem = $("<li/>"),
						$label = $("<label>" + $th.text() + "</label>"),
						$checkbox = $("<input type=\"checkbox\" />");

				// TODO Add checkbox and label to $header
				if (type == "essential") {
					$checkbox.prop("checked", true);
					$checkbox.prop("disabled", true);
				} else if (type == "optional") {
					$checkbox.prop("checked", true);
				} else if (type == "hidden") {
					$checkbox.prop("checked", false);
				} else {
					Logger.log("Responsive Table: Column Type not defined.");
				}

				$checkbox.data("responsive-column-index", j);
				console.log($checkbox.data("responsive-column-index"));

				$checkbox.on("change.toggleDisplay", function(event) {
					var $checkbox = $(this),
							index = $checkbox.data("responsive-column-index");

					var $ths = $headers.filter(":eq(" + index + ")"),
							$tds = $rows.find("td:eq(" + index + ")");

					$ths.toggle();
					$tds.toggle();
				});

				$checkbox.prependTo($label);
				$label.appendTo($listItem);
				$listItem.appendTo($list);

				$th.addClass(type);
			});

			$rows.each(function(j, tr) {
				var $tr = $(tr),
						$td = $tr.find("td");

				// for now, only apply column values if the rows are equal
				if ($td.length == $headers.length) {
					$td.each(function(k, td) {
						var $header = $($headers.get(k)),
								$td = $(td)
								type = $header.data("responsive-column") || "optional";


						if (type == "essential") {

						} else if (type == "optional") {

						} else if (type == "hidden") {

						} else {
							Logger.log("Responsive Table: Column Type not defined.");
						}

						$td.addClass(type);
					});
				}
			});

			$table.addClass("full");
			$button.appendTo($header);
			$menuBody.appendTo($header);
			$header.insertBefore(table);
		});
	}
}

$document.on("page:load ready", function(event) {
	ModalWindow.ready(event, $document);
	Tooltip.ready(event, $document);
	Tabs.ready(event, $document);
	ResponsiveTables.ready(event, $document);
	DropdownMenu.ready(event, $document); // ResponsiveTables depends on DropdownMenu

	CopyContents.ready(event);
	ToggleMenu.ready(event);
	ToggleEdit.ready(event);
	Slideshow.ready(event);

	$document.on("click.fakeLink", "[data-role*=fake-link]", function(event) {
		var $link = $(this),
				href = $link.data("href");

		if (href) {
				event.preventDefault();

				window.location = href;
		}
	});

	// Alert Stuff
	$document.on("click.openAlert", "[data-role*=open-alert]", function(event) {
		var $alert = $($(this).data("alert-selector"));

		$alert.css({
			position: "fixed",
			left: "calc(50% - " + ($alert.width() / 2) +  "px)",
			bottom: "10%"
		}).show();
	});

	$document.on("click.closeAlert", "[data-role*=close-alert]", function(event) {
		var $alert = $(this).closest(".fixed-alert");

		$alert.hide();
	});

	$document.on("keyup.closeAlert", function(event) {
		if (event.keyCode == 27) {
			var $alert = $(".fixed-alert");

			$alert.hide();
		}
	});
	// End Alert Stuff

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
