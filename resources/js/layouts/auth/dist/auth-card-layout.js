"use strict";
exports.__esModule = true;
var card_1 = require("@/components/ui/card");
var routes_1 = require("@/routes");
var react_1 = require("@inertiajs/react");
function AuthCardLayout(_a) {
    var children = _a.children, title = _a.title, description = _a.description;
    return (React.createElement("div", { className: "flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10" },
        React.createElement("div", { className: "flex w-full max-w-md flex-col gap-6" },
            React.createElement(react_1.Link, { href: routes_1.home(), className: "flex items-center gap-2 self-center font-medium" },
                React.createElement("div", { className: "flex h-9 w-9 items-center justify-center" },
                    React.createElement("img", { src: "/docset.png", alt: "Docset Logo", className: "size-9" }))),
            React.createElement("div", { className: "flex flex-col gap-6" },
                React.createElement(card_1.Card, { className: "rounded-xl" },
                    React.createElement(card_1.CardHeader, { className: "px-10 pt-8 pb-0 text-center" },
                        React.createElement(card_1.CardTitle, { className: "text-xl" }, title),
                        React.createElement(card_1.CardDescription, null, description)),
                    React.createElement(card_1.CardContent, { className: "px-10 py-8" }, children))))));
}
exports["default"] = AuthCardLayout;
