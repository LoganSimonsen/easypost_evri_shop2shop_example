EasyPost is integrated with Evri and can support ship to shop service levels, but Evri does require that the user define which shop a package should be held at. EasyPost does not have a shop location service, so I wrote up this example scripting to show how a shipper could potentially find their desired shop id from the Evri Locator API and then use that to create an Evri shipping label for shop delivery via EasyPost