# Paleo-CO2.org JSON -> Age-CO<sub>2</sub> Plot

---
## Requirements
[`d3`](https://d3js.org/) - v5 (tested with version 5.15.0)  

## What does it do?
The Paleo-CO2.org JSON -> Age-CO<sub>2</sub> Plot takes a JSON array of data formatted for Paleo-CO2.org and creates a dynamic plot with various interactive features, displaying this alongside static subplots.

The code is quite lengthy, but can be broadly broken down into:
- Loading and displaying static components (the static subplots and logo)
- Importing data and drawing the dynamic subplot
- Binding events and callbacks to the dynamic subplot for interactivity
- Creating other features for interactivity (buttons and legend)

## How does it work?
[`ageCO2Plot.js`](public/scripts/logic/ageCO2Plot.js) contains 9 classes. Which can be categorised as follows:

### Subplots
`CombinedStaticDynamicPlot` - The global `Container` for all other plot elements, most notably the `static_plot` and `dynamic_plot`. A `CombinedStaticDynamicPlot` also contains a space for a `control_panel`, which houses buttons and the plot legend.  
In terms of functionality, the `CombinedStaticDynamicPlot` makes some of the basic pieces of the plot (the SVG and background) and does some basic initialisation of variables (calculates the dimensions, make the color scale). Importantly, the `CombinedStaticDynamicPlot` also establishes links between the legend/buttons and plot.

`StaticPlot` - A relatively simple `Container` class that is designed to only contain a single image. There are two main complications:
1. Ensuring the dimensions of the `static_plot` are correct. This is done by inheriting from the parent `CombinedStaticDynamicPlot`.  
2. Allowing the static subplots to be exported during and SVG->PNG conversion. This is achieved by using a canvas to convert the original image into a dataURL, effectively embedding it into the SVG.

`DynamicPlot` - A container class for the `dynamic_plot`. Most of the complexity is in this class as it handles the user interactions with the plot.

### Controls
`Legend` - A `Container` derived class which is used to draw a legend. This is done using an array of `entries` which are `LegendEntry` objects.  
`LegendEntry` - Holds an individual entry in the legend, meaning its `name`,`color` and whether it should be `drawn`.

`ButtonArray` - Like the `Legend` class, but contains `ButtonEntry` rather than `LegendEntry`. Further complication involve the potential for some arrays of buttons to fade in/out, and for the orientation to be either horizontal or vertical.  
`ButtonEntry` - Describes and individual button, meaning its `name`, `size`, `color` and crucially a reference to the function which is called when the button is clicked (`inputFunction`).


### Generic
`Container` - A template class which is a superclass for many other classes used for the plot. This works to standardise where things are found by establishing a hierarchical structure. The `Container` has very few properties, the `parent` which contains the object, the `dimensions` which control its size, and the `content`, which is what to display. This means that rather than having arbitrary names for each object, you can access what the object is showing by accessing its `content` property.   
`Dimensions` - A template class to store the dimensions of the parent. Combines `height`, `width`, `margins` (`left`, `right`, `top`, `bottom`) and `aspect_ratio` into one place. That allows missing values to be calculated when necessary and helps keep a uniform structure for different plot elements.


## How do I run it?
Ensure d3.min.js is installed and included:
```javascript
<script type="text/javascript" src="scripts/vendor/d3.min.js"></script>
```

Add:
```javascript
 <script type="text/javascript" src="scripts/logic/ageCO2Plot.js"></script>
 ```
to the page on which you want the figure to be present.  
Ensure there is a `<div>` with id "age_co2_plot" on the page
```javascript
<div id="age_co2_plot" width="100%"></div>
```

## The input file
The input file should be JSON file containing an array of objects each with the following properties (in any order):  
### Archive + Product
| Property | Description | Type | Reason | Notes  
| --- | --- | --- | --- | --- |
| `proxy` | Name of the proxy being used | `categorical text` | Color of data in age-CO<sub>2</sub> plot, Filtering of age-CO<sub>2</sub> plot | Must be one of: _Phytoplankton_, _Boron isotopes_, _Stomatal Frequencies_, _Leaf Gas Exchange_, _Liverworts_, _Leaf Carbon Isotopes_, _Paleosols_, _Nahcolite/Trona_ |
| `age_ka` | Age of the datapoint in kiloyears | `float` | X axis of age-CO<sub>2</sub> plot |  |
| `age_uncertainty_pos_ka` | Older uncertainty of the age of the datapoint in kiloyears | `float` | X axis of age-CO<sub>2</sub> plot |  |
| `age_uncertainty_neg_ka` | Younger uncertainty of the age of the datapoint in kiloyears | `float` | X axis of age-CO<sub>2</sub> plot |  |
| `co2_ppm` | Atmospheric CO<sub>2</sub> of the datapoint in ppm | `float` | Y axis of age-CO<sub>2</sub> plot |  |
| `co2_uncertainty_pos_ppm` | Upper uncertainty of atmospheric CO<sub>2</sub> of the datapoint in ppm | `float` | Y axis of age-CO<sub>2</sub> plot |  |
| `co2_uncertainty_neg_ppm` | Lower uncertainty of atmospheric CO<sub>2</sub> of the datapoint in ppm | `float` | Y axis of age-CO<sub>2</sub> plot |  |
| `reference` | Citation of the publication of the datapoint | `formatted text` | Export of references, Key of archive-product version plot |  |
| `DOI` | Digital Object Identifier for the publication of the datapoint | `formatted text` | Link in archive-product version plot | Should start with http://dx.doi.org/ for valid link generation |


### Product Only
| Property | Description | Type | Reason | Notes  
| --- | --- | --- | --- | --- |
| `age_superseded` | Flag which is true if a subsequent publication has revised the age of the datapoint | `boolean` | Filtering of age-CO<sub>2</sub> plot, Filtering of archive-product plot |  |
| `age_recalculated` | Flag which is true if [paleo-co2.org](paleo-co2.org) has revised the age of the datapoint | `boolean` | Filtering of age-CO<sub>2</sub> plot, Filtering of archive-product plot |  |
| `age_recalculated_reason` | Reason describing why [paleo-co2.org](paleo-co2.org) has revised the age | `text` | Display on archive-product version plot |  |
| `age_quarantined` | Flag which is true if the age of the datapoint is _quarantined_ - meaning it is considered no longer scientifically sound | `boolean` | Filtering of age-CO<sub>2</sub> plot, Filtering of archive-product plot |  |
| `age_quarantined_reason` | Reason describing why [paleo-co2.org](paleo-co2.org) has declared the age scientifically unsound | `text` | Display on archive-product version plot |  |
| `co2_superseded` | Flag which is true if a subsequent publication has revised the CO<sub>2</sub> of the datapoint  | `boolean` | Filtering of age-CO<sub>2</sub> plot, Filtering of archive-product plot |  |
| `co2_recalculated` | Flag which is true if [paleo-co2.org](paleo-co2.org) has revised the CO<sub>2</sub> of the datapoint | `boolean` | Filtering of age-CO<sub>2</sub> plot, Filtering of archive-product plot |  |
| `co2_recalculated_reason` | Reason describing why [paleo-co2.org](paleo-co2.org) has revised the CO<sub>2</sub> | `text` | Display on archive-product version plot |  |
| `co2_quarantined` | Flag which is true if the CO<sub>2</sub> of the datapoint is _quarantined_ - meaning it is considered no longer scientifically sound | `boolean` | Filtering of age-CO<sub>2</sub> plot, Filtering of archive-product plot |  |
| `co2_quarantined_reason` | Reason describing why [paleo-co2.org](paleo-co2.org) has declared the CO<sub>2</sub> scientifically unsound | `text` | Display on archive-product version plot |  |
