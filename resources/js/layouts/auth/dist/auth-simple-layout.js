"use strict";
exports.__esModule = true;
var routes_1 = require("@/routes");
var react_1 = require("@inertiajs/react");
function AuthSimpleLayout(_a) {
    var children = _a.children, title = _a.title, description = _a.description;
    return (React.createElement("div", { className: "flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10" },
        React.createElement("div", { className: "w-full max-w-sm" },
            React.createElement("div", { className: "flex flex-col gap-8" },
                React.createElement("div", { className: "flex flex-col items-center gap-4" },
                    React.createElement(react_1.Link, { href: routes_1.home(), className: "flex flex-col items-center gap-2 font-medium" },
                        React.createElement("div", { className: "mb-1 flex h-9 w-9 items-center justify-center" },
                            React.createElement("img", { src: "/docset.png", alt: "Docset Logo", className: "size-9" })),
                        React.createElement("span", { className: "sr-only" }, title)),
                    React.createElement("div", { className: "space-y-2 text-center" },
                        React.createElement("h1", { className: "text-xl font-medium" }, title),
                        React.createElement("p", { className: "text-center text-sm text-muted-foreground" }, description))),
                children))));
}
exports["default"] = AuthSimpleLayout;
