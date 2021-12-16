## Getting Started

In the web project include pp-events.js with:

```html
<script src="https://cdn.jsdelivr.net/npm/pp-is@latest/pp-is.min.js" ></script>
<script src="https://cdn.jsdelivr.net/npm/pp-events@latest/pp-events.min.js" ></script>
```

Or

## Install

```console
npm i pp-events --save
```

## Initialize

```javascript
// Declare event manager here
var Event = new events()

//say hello function for execute
var sayHello = function( msg ){
	console.log(msg)
}

Event.on("sayHello",sayHello)

Event.emit("sayHello","Hi everyone !!!!!")

// remove Events if will be necesary

Event.removeListener("sayHello",sayHello);

```

## Methods

### `on`

```javascript
Event.on("eventName",myFunction);
```
---

### `emit`
```javascript
Event.emit("eventName",{
	mydata:"myvalue",
	otherData:"otherValue"
});
```
---

### `checkOn`
```javascript
Event.checkOn("eventName");
```
---

### `removeListener`
```javascript
Event.removeListener("eventName",myFunction);
```
