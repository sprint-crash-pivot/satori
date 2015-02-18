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

var $document = $(document);

$document.on("page:load ready", function(event) {
	console.log("Satori!");
	
	CopyContents.ready(event);
	ToggleMenu.ready(event);
	ToggleEdit.ready(event);

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