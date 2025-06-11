function updateContentAreas($results) {
  // List of content areas to update
  const contentAreas = [
    ".grid-header",
    ".header-bar",
    ".header.page-title",
    ".show-more",
  ];

  contentAreas.forEach((selector) => {
    const $content = $results.find(selector);
    $(selector).html($content.html());
  });
}

function updateFilterValues($results, filters) {
  // Update select dropdowns
  ["#galleryEventName", "#galleryEventYear", "#galleryCategory"].forEach(
    (selector) => {
      const $filter = $(selector);
      const value =
        filters[$filter.attr("id")] || $results.find(selector).val();
      $filter.val(value);
    }
  );
}
function initializeFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    let hasFilters = false;
    
    $('.gallery-filter-form select').each(function() {
        const filterId = $(this).attr('id');
        // Ensure null option exists
        if ($(this).find('option[value=""]').length === 0) {
            $(this).prepend('<option value="">All</option>');
        }
        
        if (urlParams.has(filterId)) {
            const paramValue = urlParams.get(filterId);
            if (paramValue && $(this).find(`option[value="${paramValue}"]`).length) {
                $(this).val(paramValue);
                hasFilters = true;
            } else {
                $(this).val(''); // Select null option
            }
             } else {
            $(this).val(''); // Default to null option
        }
    });
}

function parseResults(response, filters) {
  const $results = $(response);
  // 1. First update all content areas
  updateContentAreas($results);
  // 2. Then update filter values while preserving selections
  updateFilterValues($results, filters);
}

module.exports = {
  galleryContentPageTabs: function () {
    $(document).ready(function () {
      $(".tab-links a").click(function (e) {
        e.preventDefault();

        var target = $(this).attr("href");

        // Show the selected tab and hide others
        $(target).show();
        $(target).siblings().hide();

        // Set the clicked tab to active and remove active from others
        $(this).parent().addClass("active");
        $(this).parent().siblings().removeClass("active");
      });
    });
  },
  filter: function () {
    $(document).ready(function (e) {
                  initializeFiltersFromURL();

      $(document).on("click", ".apply-gallery-filter-btn", function (e) {
        e.preventDefault();

        var filters = {};
        $(".gallery-filter-form select, .gallery-filter-form input").each(
          function () {
            var filterName = $(this).attr("name") || $(this).attr("id");
            var value = $(this).val();
            if (value && value !== "Open this select an option") {
              filters[filterName] = value;
              $(this).data("selected", value);
            } else {
              $(this).removeData("selected");
            }
          }
        );

        // Convert filters to URL parameters
        var queryParams = $.param(filters);
        var currentUrl = window.location.pathname;
        var newUrl = currentUrl + (queryParams ? "?" + queryParams : "");
        var ajaxUrl = newUrl;

        history.pushState(null, "", newUrl);
        $.spinner().start();

        $.ajax({
          url: ajaxUrl,
          method: "GET",
          data: filters,
          success: function (response) {
            parseResults(response, filters);
            window.location.reload();
            $.spinner().stop();
          },
          error: function (error) {
            console.log("error:", error);
            $.spinner().stop();
          },
        });
      });
    });
  },
};
