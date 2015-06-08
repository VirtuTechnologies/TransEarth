//var TransEarthApp = angular.module('TransEarthApp', ['ngRoute', 'ui.bootstrap', "ngGrid", "ngTable", 'ngSanitize']);
var TransEarthApp = angular.module('TransEarthApp',
    [
        'ngRoute',
        'ngAnimate',
        'ui.bootstrap',
        'ngGrid',
        "daterangepicker",
        //'angular-bootstrap-select',
        //'nya.bootstrap.select',
        'ngTable'
    ]
);

TransEarthApp.factory('httpInterceptor', function ($q, $rootScope, $log) {

    var numLoadings = 0;

    return {
        request: function (config) {

            numLoadings++;

            // Show loader
            $rootScope.$broadcast("loader_show");
            return config || $q.when(config)

        },
        response: function (response) {

            if ((--numLoadings) === 0) {
                // Hide loader
                $rootScope.$broadcast("loader_hide");
            }

            return response || $q.when(response);

        },
        responseError: function (response) {

            if (!(--numLoadings)) {
                // Hide loader
                $rootScope.$broadcast("loader_hide");
            }

            return $q.reject(response);
        }
    };
});

TransEarthApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
});

TransEarthApp.directive("loader", function ($rootScope) {
    return function ($scope, element, attrs) {
        $scope.$on("loader_show", function () {
            return element.show();
        });
        return $scope.$on("loader_hide", function () {
            return element.hide();
        });
    };
});

TransEarthApp.factory('UserRequest', function () {

    var user_profile = {};

    function resetUserProfile(){
        user_profile = {};
    }

    function setUserProfile(user){
        if(typeof user.username != "undefined" && user.username != null && user.username != ""){
            user_profile.username = user.username;
        }
        if(typeof user.user_type != "undefined" && user.user_type != null && user.user_type != ""){
            user_profile.user_type = user.user_type;
        }
        if(typeof user.display_name != "undefined" && user.display_name != null && user.display_name != ""){
            user_profile.display_name = user.display_name;
        }
        if(typeof user.email != "undefined" && user.email != null && user.email != ""){
            user_profile.email = user.email;
        }
        if(typeof user.user_information != "undefined" && user.user_information != null){
            user_profile.user_information = user.user_information;
        }
    }
    function getUserProfile(){
        return user_profile;
    }
    function getUserName(){
        return user_profile.username;
    }
    function getEmail(){
        return user_profile.email;
    }
    function getUserType(){
        return user_profile.user_type;
    }

    return {
        getUserName : getUserName,
        getEmail : getEmail,
        getUserType : getUserType,
        setUserProfile : setUserProfile,
        resetUserProfile : resetUserProfile,
        getUserProfile : getUserProfile
    };
});

TransEarthApp.factory('TruckRequest', function(){
    var _truck;
    var _processed;
    //var _truck;
    return {
        getSharedTruck : function(){
            //console.log("Truck Request Get Shared Truck Details:"+JSON.stringify(_truck));
            return _truck;
        },
        setSharedTruck : function(truck){
            //console.log("Truck Request Set Shared Truck Details:"+JSON.stringify(truck));
            _truck = truck;
        },
        isSharedTruckProcessed : function(){
            return _processed;
        },
        setSharedTruckProcessed : function(status){
            _processed = status;
        },
        resetSharedTruck : function(status){
            var temp;
            _processed = temp;
            _truck = temp;
        }
    };
});

TransEarthApp.factory('TruckPostRequest', function(){
    var _truck;
    var _postId;
    var _saved;
    return {
        getSharedTruck : function(){
            //console.log("Truck Post Request Get Shared Truck Details:"+JSON.stringify(_truck));
            return _truck;
        },
        setSharedTruck : function(truck){
            //console.log("Truck Post Request Set Shared Truck Details:"+JSON.stringify(truck));
            _truck = truck;
        },
        getSharedTruckPostId : function(){
            //console.log("Truck Post Request Get Shared Post ID:"+_postId);
            return _postId;
        },
        setSharedTruckPostId : function(postId){
            //console.log("Truck Post Request Set Shared Post ID:"+postId);
            _postId = postId;
        },
        isSharedTruckPostProcessed : function(){
            return _saved;
        },
        setSharedTruckPostProcessed : function(status){
            _saved = status;
        },
        resetSharedTruckPost : function(status){
            var temp;
            _postId = temp;
            _truck = temp;
            _saved= temp;
        }
    };
});

TransEarthApp.factory('LoadRequest', function(){
    var _load;
    var _processed;
    return {
        getSharedLoad : function(){
            //console.log("Load Request Get Shared Truck Details:"+JSON.stringify(_load));
            return _load;
        },
        setSharedLoad : function(load){
            //console.log("Load Request Set Shared Truck Details:"+JSON.stringify(load));
            _load = load;
        },
        isSharedLoadProcessed : function(){
            return _processed;
        },
        setSharedLoadProcessed : function(status){
            _processed = status;
        }
    };
});

TransEarthApp.directive("loader", function ($rootScope) {
    return function ($scope, element, attrs) {
        $scope.$on("loader_show", function () {
            return element.show();
        });
        return $scope.$on("loader_hide", function () {
            return element.hide();
        });
    };
});

TransEarthApp.directive('collapseSection', function() {
    return {
        controller: function noteChange($scope) {
            $scope.note = "E";
            $scope.change = function(){
                if($scope.note == "E"){
                    $scope.note = "C";
                }else{
                    $scope.note = "E";
                }
            };
        },
        restrict: 'EA',
        transclude: true,
        scope: true,
        link: function($scope, element, attrs, noteChange) {
            var title= angular.element(element.parent().parent().children().children()[1]),
                body = angular.element(element.parent().parent().parent().children()[1]);
            title.on('click', function($event) {
                if (typeof body != 'undefined'
                    && typeof body[0] != 'undefined'
                    && typeof body[0].style != 'undefined'){
                    var section = 'block';
                    if(body[0].style.display == 'none'){
                        section = 'block';
                    }else{
                        section = 'none';
                    }
                    body.css({
                        display: section
                    });
                }
                $event.preventDefault();
            });
        },
        template: '<div class="pull-right glyphicon title2"><a href="#" ng-click="change()" ng-class="{\'glyphicon-chevron-down\': note == \'C\', \'glyphicon-chevron-right\': note != \'C\'}"></a></div>'
    };
});

TransEarthApp.directive('ngCompare', function () {
    return {
        require: 'ngModel',
        link: function (scope, currentEl, attrs, ctrl) {
            var comparefield = document.getElementsByName(attrs.ngCompare)[0]; //getting first element
            compareEl = angular.element(comparefield);

            //current field key up
            currentEl.on('keyup', function () {
                if (compareEl.val() != "") {
                    var isMatch = currentEl.val() === compareEl.val();
                    ctrl.$setValidity('compare', isMatch);
                    scope.$digest();
                }
            });

            //Element to compare field key up
            compareEl.on('keyup', function () {
                if (currentEl.val() != "") {
                    var isMatch = currentEl.val() === compareEl.val();
                    ctrl.$setValidity('compare', isMatch);
                    scope.$digest();
                }
            });
        }
    }
});

TransEarthApp.directive('googlePlacesTemp', function(){
    return {
        restrict:'E',
        replace:true,
        // transclude:true,
        scope: {location:'='},
        template: '<input id="google_places_ac" name="google_places_ac" type="text" class="input-block-level"/>',
        link: function($scope, elm, attrs){
            var autocomplete = new google.maps.places.Autocomplete($("#google_places_ac")[0], {});
            google.maps.event.addListener(autocomplete, 'place_changed', function() {
                var place = autocomplete.getPlace();
                $scope.location = place.address_components;
                $scope.$apply();
            });
        }
    }
});

TransEarthApp.directive('formattedAddress', function(){
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, controller) {
            controller.$parsers.push(function(value) {
                console.log("value: "+value);
                if(typeof value != "undefined"
                        && value != null
                        && typeof value["formatted-address"] != "undefined"
                        && value["formatted-address"] != null){
                    console.log("formatted value: "+value["formatted-address"]);
                    return value["formatted-address"];
                }else{
                    return ;
                }
            });
        }
    }
});

TransEarthApp.directive('googlePlaces', ["$compile", function($compile){
    return {
        restrict:'AE',
        //replace:true,
        replace:false,
        require: ['^form'],
        controller: 'CityCtrl',
        // transclude:true,
        scope: {
            location : '=',
            tagId : "@",
            tagName : "@"
        },
        //template: '<input id="{{tagId}}" name="{{tagName}}" type="text" class="input-block-level"/>',
        //template: '<input id="hash" name="hash" type="text" class="input-block-level"/>',
        //template: '<div><input id="hash" name="hash" type="text" class="input-block-level"/>{{tagId}}</div>',
        link: function($scope, elm, attrs, ctrls){
            var tagId = attrs.tagid;
            var tagName = attrs.tagname;
            var requiredAttr = attrs.required;
            var placeHolder = attrs.holder;
            var glyph = attrs.glyph;
            var glyphDisplay = false;
            var disable;
            $scope.form = ctrls[0];
            if (typeof placeHolder == "undefined" || placeHolder == null) {
                placeHolder = "Enter Location";
            }
            if (typeof requiredAttr != "undefined" && requiredAttr != null) {
                // If attribute required exists
                // ng-required takes a boolean
                $scope.required = true;
            }else{
                $scope.required = false;
                if(typeof $scope.location != "undefined" && $scope.location != null){
                    $scope.location.isSelected = true;
                }
            }
            //console.log("Required set on initialize: "+$scope.required);
            if(typeof $scope.location == "undefined" || $scope.location == null){
                //$scope.city = {};
                disable = false;
            }else{
                disable = $scope.location.disable;
            }
            if (typeof glyph == "undefined" || glyph == null) {
                glyphDisplay = true;
            }else{
                glyphDisplay = false;
            }

            var template =
                    '<div class="input-group"> ' +
                        '<span class="input-group-addon"><i class="fa fa-map-marker fa-2"></i></span> ' +
                        '<div id="city"> ' +
                            '<div ng-class="{\'has-error\': form.'+tagName+'.$error.required && !location.isSelected, ' +
                            '\'has-success\' : !(form.'+tagName+'.$error.required) && location.isSelected, '+
                            '\'has-feedback\' : form.'+tagName+'.$error.required && !location.isSelected}">' +
                                '<input class="form-control" id="'+tagId+'" name="'+tagName + '" ' +
                                'ng-disabled="location.disable" type="text" class="input-block-level" '+
                                'ng-change="resetPlace()" ' +
                                'placeholder="'+placeHolder+'" ' +
                                'ng-model="location.display" ng-required="'+$scope.required+'"'+
                                '/> ' +
                            '</div> ' +
                        '</div> ' +
                    '</div> '+
                        //'<span ng-show="form.'+tagName+'.$error.required" class="help-block">Required</span> ' +
                    '<i class="form-control-feedback" ng-if="'+glyphDisplay+'"' +
                                'ng-class="{ \'glyphicon glyphicon-remove\' : form.'+tagName+'.$error.required || !location.isSelected, '+
                                '\'glyphicon glyphicon-ok\' : !form.'+tagName+'.$error.required && location.isSelected, '+
                                '\'has-feedback\' : form.'+tagName+'.$error.required && !location.isSelected}" '+
                                'for="city"> ' +
                    '</i>'+
                    '<div ng-if="form.'+tagName+'.$error.required" '+
                                'class="help-block pull-right" '+
                                'ng-class="{ \'has-error\' : form.'+tagName+'.$error.required && !location.isSelected, '+
                                '\'has-success\' : !form.'+tagName+'.$error.required && location.isSelected, '+
                                '\'has-feedback\' : form.'+tagName+'.$error.required && !location.isSelected}" '+
                                'for="city">Location is mandatory'+
                    '</div> '
                    //+ '<pre>{{form.'+tagName+'.$error | json}} {{location.isSelected}}</pre> '
                ;
            //console.log("Template set on initialize: "+template);
            //console.log("Scope set on initialize: "+$scope);
            //console.log("Attr set on initialize: "+attrs.required);
            $scope.resetPlace = function(){
                if(typeof $scope.location != "undefined" && $scope.location!= null){
                    //console.log("Resetting place as it is changed: "+JSON.stringify($scope.location));
                    //$scope.location.place = "";
                    //$scope.location.state = "";
                    if(requiredAttr){
                        $scope.location.isSelected = false;
                        $scope.location.disable = false;
                    }else if($scope.location.display == ""){
                        $scope.location.place = "";
                        $scope.location.isSelected = true;
                        $scope.location.disable = false;
                    }else{
                        $scope.location.isSelected = false;
                        $scope.location.disable = false;
                    }
                }
            };
            elm.html(template);
            $compile(elm.contents())($scope);
            if(typeof $scope.location != "undefined" && $scope.location != null){
                //console.log("Location set on initialize for "+"#"+tagId+" : "+JSON.stringify($scope.location));
                $("#"+tagId).val($scope.location.place);
                //$("#ownr_city").val($scope.city.place);
            }

            var autocomplete = new google.maps.places.Autocomplete($("#"+tagId)[0], {types: ['(cities)'],componentRestrictions: {country: 'in'}});
            //var autocomplete = new google.maps.places.Autocomplete($("#hash")[0], {});
            google.maps.event.addListener(autocomplete, 'place_changed', function() {
                var place = autocomplete.getPlace();
                //$scope.city = {};
                if(typeof place != "undefined" && place != null && typeof place.address_components != "undefined" && place.address_components != null){
                    console.log("place: "+JSON.stringify(place));
                    var result = getObjects(place.address_components, 'types', 'locality', null, null);
                    //console.log("result: "+JSON.stringify(result));
                    //$scope.city.place = place.address_components;
                    if(Array.isArray(result) && result.length > 0){
                        $scope.location.place = result[0].long_name;
                        $scope.location.isSelected = true;
                        $scope.location["formatted-address"] = result[0]["formatted-address"];
                    }
                    result = getObjects(place.address_components, 'types', 'administrative_area_level_1', null, null);
                    if(Array.isArray(result) && result.length > 0){
                        $scope.location.state = result[0].long_name;
                        //$scope.city.isSelected = true;
                    }
                    result = getObjects(place.address_components, 'types', 'country', null, null);
                    if(Array.isArray(result) && result.length > 0){
                        $scope.location.country = result[0].long_name;
                        //$scope.city.isSelected = true;
                    }
                }else{
                    console.log("place not defined");
                    if(requiredAttr){
                        $scope.location.isSelected = false;
                    }else{
                        $scope.location.isSelected = true;
                    }
                }
                //console.log(JSON.stringify(place));
                console.log(JSON.stringify($scope.location));
                $scope.$apply();
            });
        }
    }
}]);

TransEarthApp.directive('myFocus', function () {
    return {
        restrict: 'A',
        link: function postLink(scope, element, attrs) {
            console.log("myFocus directive:"+attrs);
            if (attrs.myFocus == "") {
                attrs.myFocus = "focusElement";
            }
            scope.$watch(attrs.myFocus, function(value) {
                if(value == attrs.id) {
                    element[0].focus();
                }
            });
            element.on("blur", function() {
                scope[attrs.myFocus] = "";
                scope.$apply();
            })
        }
    };
});

TransEarthApp.controller('CityCtrl', ['$scope', function($scope) {
}]);

/*TransEarthApp.directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});*/

TransEarthApp.directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});

TransEarthApp.directive('capitalizeNoBlanks', function(uppercaseFilter, $parse) {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            //console.log(attrs.ngModel);
            var capitalize = function(inputValue) {
                //console.log(inputValue);
                var capitalized;
                if(typeof  inputValue != "undefined" && inputValue != null){
                    //capitalized = inputValue.toUpperCase();
                    capitalized = inputValue.replace(/\s+/g,'').toUpperCase();
                    /*var capitalized = inputValue.split(' ').reduce(function(prevValue, word){
                     return  prevValue + word.substring(0, 1).toUpperCase() + word.substring(1)+' ';
                     }, '');*/
                    if(capitalized !== inputValue) {
                        modelCtrl.$setViewValue(capitalized);
                        modelCtrl.$render();
                    }
                    return capitalized;
                }
            };
            var model = $parse(attrs.ngModel);
            modelCtrl.$parsers.push(capitalize);
            capitalize(model(scope));
        }
    };
});

TransEarthApp.directive('capitalizeAll', function(uppercaseFilter, $parse) {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            //console.log(attrs.ngModel);
            var capitalize = function(inputValue) {
                //console.log(inputValue);
                var capitalized;
                if(typeof  inputValue != "undefined" && inputValue != null){
                    capitalized = inputValue.replace(/\s+/g,'').toUpperCase();
                    /*var capitalized = inputValue.split(' ').reduce(function(prevValue, word){
                     return  prevValue + word.substring(0, 1).toUpperCase() + word.substring(1)+' ';
                     }, '');*/
                    if(capitalized !== inputValue) {
                        modelCtrl.$setViewValue(capitalized);
                        modelCtrl.$render();
                    }
                    return capitalized;
                }
            };
            var model = $parse(attrs.ngModel);
            modelCtrl.$parsers.push(capitalize);
            capitalize(model(scope));
        }
    };
});

TransEarthApp.directive('capitalizeFirst', function(uppercaseFilter, $parse) {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            //console.log(attrs.ngModel);
            var capitalize = function(inputValue) {
                //console.log(inputValue);
                var capitalized;
                if(typeof  inputValue != "undefined" && inputValue != null){
                    //capitalized = inputValue.replace(/\s+/g,'').toUpperCase();
                    var capitalized = inputValue.split(' ').reduce(function(prevValue, word){
                        return  prevValue + word.substring(0, 1).toUpperCase() + word.substring(1)+' ';
                    }, '');
                    if(capitalized !== inputValue) {
                        modelCtrl.$setViewValue(capitalized);
                        modelCtrl.$render();
                    }
                    return capitalized;
                }
            };
            var model = $parse(attrs.ngModel);
            modelCtrl.$parsers.push(capitalize);
            capitalize(model(scope));
        }
    };
});
//Route Provider to load views with ng-view
TransEarthApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider) {
        //alert('Inside Route Provider'+$routeProvider);
        $routeProvider.
            when('/index', {
                templateUrl: 'partials/blank.html',
                controller: 'indexCtrl'
            }).
            when('/truckList', {
                templateUrl: 'partials/trucks_grid.html',
                controller: 'truckListCtrl'
            }).
            when('/loadList', {
                templateUrl: 'partials/loads_grid.html',
                controller: 'loadListCtrl'
            }).
            when('/login', {
                templateUrl: 'partials/login.html',
                controller: 'loginCtrl'
            }).
            otherwise({
                //templateUrl: 'partials/blank.html',
                controller: 'indexCtrl'
            });
    }]);

var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;

function convertDateStringsToDates(input) {
    // Ignore things that aren't objects.
    if (typeof input !== "object") return input;

    for (var key in input) {
        if (!input.hasOwnProperty(key)) continue;

        var value = input[key];
        var match;
        // Check for string properties which look like dates.
        if (typeof value === "string" && (match = value.match(regexIso8601))) {
            var milliseconds = Date.parse(match[0])
            if (!isNaN(milliseconds)) {
                input[key] = new Date(milliseconds);
            }
        } else if (typeof value === "object") {
            // Recurse into object
            convertDateStringsToDates(value);
        }
    }
}

function getObjects(obj, key, val, parentKey, parentObj) {
    var objects = [];
    for (var i in obj) {
        //console.log("i: "+JSON.stringify(i)+" value "+JSON.stringify(obj[i]));
        if (!obj.hasOwnProperty(i)) continue;
        //console.log("continue with i: "+JSON.stringify(i)+" value "+JSON.stringify(obj[i]));
        if (typeof obj[i] == 'object') {
            //console.log("Start object flattening: "+JSON.stringify(obj[i]));
            objects = objects.concat(getObjects(obj[i], key, val, i, obj));
            //console.log("Concatenated objects: "+JSON.stringify(objects));
        } else if (i == key && obj[key] == val) {
            //console.log("Found objects: key: "+i+" object: "+JSON.stringify(obj[key]));
            objects.push(obj);
        }else if(parentKey == key && obj[i] == val){
            //console.log("Found array item: key: "+key+" object pushed: "+JSON.stringify(parentObj));
            objects.push(parentObj);
        }
    }
    return objects;
}

//Head controller to load page title
function coreController($scope, $rootScope, $http, $location, UserRequest, TruckRequest) {
//function coreController($scope, $route, $http, $location, UserRequest) {
    //alert('Inside coreController');
    $scope.siteTitle = 'Transport Earth';
    $scope.page = {};
    $scope.core = {};
    $scope.core.pageHeaders = {
        "home" : "Home",
        "login" : "Login",
        "searchTrucks" : "Search Truck",
        "searchLoads" : "Search Load",
        "myTrucks" : "My Trucks",
        "myLoads" : "My Loads",
        "addTruck" : "Add Truck",
        "addLoad" : "Add Load",
        "sessionExpired" : "Session Expired"
    };
    $scope.core.truck_owner = false;
    $scope.core.load_owner = false;
    $scope.serverAuth = {};
    $scope.serverAuth.authFailed = false;
    $scope.serverAuth.messageAvailable = false;

    $scope.ifSessionInvalid = false;
    $scope.user = {};
    $scope.core.loggedIn = false;
    $scope.core.expired = false;

    $scope.resetCore = function(){
        //$scope.siteHome();
        //$scope.core = {};
        $scope.core.loggedIn = false;
        $scope.core.truck_owner = false;
        $scope.core.load_owner = false;
        $scope.serverAuth = {};
        $scope.serverAuth.authFailed = false;
        $scope.serverAuth.messageAvailable = false;
        $scope.user = {};
        $scope.core.loggedIn = false;
        $scope.core.expired = true;
    } ;

    $scope.$watch('local', function(){
        console.log("Core ng-init local: "+$scope.local);
        $scope.ifSessionInvalid = false;
        if(typeof $scope.local != "undefined" && $scope.local != null){
            $scope.session = JSON.parse($scope.local);
            console.log("Set $scope.session: "+JSON.stringify($scope.session));
            if(typeof $scope.session != "undefined" && $scope.session != null && $scope.session.loginFailed){
                $scope.serverAuth.authFailed = true;
                $scope.serverAuth.messageAvailable = true;
                $scope.serverAuth.message = $scope.session.loginError;
                console.log("Set $scope.serverAuth: "+JSON.stringify($scope.serverAuth));
            }
            if(typeof $scope.session.expired != "undefined" && $scope.session.expired != null && !$scope.local.expired){
                console.log("Session not valid: "+JSON.stringify($scope.session));
                TruckRequest.resetSharedTruck();
                UserRequest.resetUserProfile();
                //TruckPostRequest.resetSharedTruckPost();
                $scope.ifSessionInvalid = true;
                $scope.resetCore();
                $scope.siteHome();
                $scope.$apply();
                //window.location.reload(true);
            }
        }
    });

    $http.get('/TransEarth/getLoggedInUserProfile')
        .success(function(data){
            console.log("Get User Profile: "+JSON.stringify(data));
            $scope.core.truck_owner = false;
            $scope.core.load_owner = false;
            $scope.core.agent = false;
            $scope.core.contractor = false;
            if(typeof data.user != 'undefined'){
                $scope.user = data.user;
                $scope.core.loggedIn = true;
                if(typeof $scope.user.user_type != "undefined"){
                    if($scope.user.user_type == "truck_owner"){
                        $scope.core.truck_owner = true;
                    }else if($scope.user.user_type == "load_owner"){
                        $scope.core.load_owner = true;
                    }else if($scope.user.user_type == "agent"){
                        $scope.core.agent = true;
                    }else if($scope.user.user_type == "contractor"){
                        $scope.core.contractor = true;
                    }
                    /*else if(Array.isArray($scope.user.user_type)){
                        console.log("Array User type: "+$scope.user.user_type);
                        for(var user_type in $scope.user.user_type){
                            console.log("User type item: "+$scope.user.user_type[user_type]);
                            if($scope.user.user_type[user_type] == "truck_owner"){
                                $scope.core.truck_owner = true;
                            }
                            if($scope.user.user_type[user_type] == "load_owner"){
                                $scope.core.load_owner = true;
                            }
                        }
                    }*/
                    console.log("$scope.core.truck_owner: "+$scope.core.truck_owner);
                    console.log("$scope.core.load_owner: "+$scope.core.load_owner);
                    console.log("$scope.core.agent: "+$scope.core.agent);
                    console.log("$scope.core.contractor: "+$scope.core.contractor);
                }
                //console.log("Core Profile: "+JSON.stringify($scope.core));
            }else{
                $scope.core.expired = true;
            }
            console.log("$scope.serverAuth: "+JSON.stringify($scope.serverAuth));
            /*if($scope.core.truck_owner){
                $scope.page.template = "/TransEarth/truck_owner_home";
                $scope.page.scope = "Truck Owner Home";
            }else if($scope.core.load_owner){
                $scope.page.template = "/TransEarth/load_owner_home";
                $scope.page.scope = "Load Owner Home";
            }else if($scope.serverAuth.authFailed){
                $scope.page.template = ''+"/TransEarth/login";
                $scope.page.scope = "Login";
            }else{
                $scope.page.template = "/TransEarth/site_home";
                $scope.page.scope = "Site Base Home";
            }*/
            if($scope.serverAuth.authFailed){
                $scope.page.template = ''+"/TransEarth/login";
                $scope.page.scope = "Login";
            }else{
                $scope.siteHome();
            }

        }).error(function(err){
            alert("Error accessing user profile:"+err);
        });
    //console.log("User: "+$scope.user);

    //console.log("User Details: "+$scope.user);
    /*$scope.$watch('pageTemplate', function(pageTemplate) {
        console.log("pageTemplate: "+JSON.stringify(pageTemplate));
    }, true);*/

    /*$http.get('/TransEarth/getAuthMsg')
        .success(function(data){
            console.log("Get Auth Message: "+JSON.stringify(data));
            $scope.login.messageAvailable = false;
            if(typeof data.initial != 'undefined'){
                $scope.login.messageAvailable = false;
                $scope.page.template = "/TransEarth/site_home";
                //alert($scope.authFailed);
            }else if(typeof data.messageAvailable !='undefined' && data.messageAvailable != null && data.messageAvailable){
                $scope.login.messageAvailable = true;
                $scope.page.template = "/TransEarth/login";
                succesError(data, 'login_alert');
                //alert(JSON.stringify(data));
            }else{
                $scope.page.template = "/TransEarth/site_home";
            }
            //alert('$scope.authFailed Data - '+JSON.stringify(data));
        }).error(function(data){
            alert("error accessing Auth message");
        });*/

    $scope.siteHome = function(){
        //console.log("Home clicked");
        $scope.page.template = ''+"/TransEarth/site_home";
        $scope.page.scope = "TransEarth Home";
        //console.log("Login clicked : "+$scope.pageTemplate);
    };
    $scope.loginClicked = function(){
        //console.log("Login clicked");
        $scope.core.expired = false;
        $scope.page.template = ''+"/TransEarth/login";
        $scope.page.scope = "Login";
        //console.log("Login clicked : "+$scope.pageTemplate);
    };
    $scope.signupClicked = function(){
        //console.log("Login clicked");
        $scope.page.template = ''+"/TransEarth/signup";
        $scope.page.scope = "Register";
        //console.log("Login clicked : "+$scope.pageTemplate);
    };

    $scope.searchTrucks = function(){
        //console.log("Search Trucks clicked");
        $scope.page.template = ''+"/TransEarth/searchTrucks";
        $scope.page.scope = "Search Trucks";
        //console.log("Search Truck clicked : "+$scope.pageTemplate);
    };
    $scope.searchLoad = function(){
        //console.log("Search Load clicked");
        $scope.page.template = ''+"/TransEarth/searchLoad";
        $scope.page.scope = "Search Load";
        //console.log("Search Load clicked : "+$scope.pageTemplate);
    };

    $scope.loadMyTrucks = function(){
        //console.log("Truck Owner Home Page clicked");
        $scope.page.template = ''+"/TransEarth/truck_owner_home";
        $scope.page.scope = "Truck Owner Home";
        //console.log("Search Truck clicked : "+$scope.pageTemplate);
    };
    $scope.addTruck = function(){
        console.log("Add Truck clicked");
        TruckRequest.setSharedTruck(null);
        $scope.page.template = null;
        $scope.page.template = ''+"/TransEarth/manage_truck?test=1";
        $scope.page.scope = "Add Truck";
        //console.log("Search Truck clicked : "+$scope.pageTemplate);
    };

    $scope.loadMyLoads = function(){
        console.log("My Loads clicked");
        $scope.page.template = ''+"/TransEarth/load_owner_home";
        $scope.page.scope = "Load Owner Home";
        //console.log("Search Truck clicked : "+$scope.pageTemplate);
    };
    $scope.addLoad = function(){
        //console.log("My Loads clicked");
        $scope.page.template = ''+"/TransEarth/manage_load";
        $scope.page.scope = "Add Load";
        //console.log("Search Truck clicked : "+$scope.pageTemplate);
    };
    //$scope.$route = $route;
}

