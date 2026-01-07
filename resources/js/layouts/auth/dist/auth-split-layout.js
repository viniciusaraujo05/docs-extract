"use strict";
exports.__esModule = true;
var routes_1 = require("@/routes");
var react_1 = require("@inertiajs/react");
function AuthSplitLayout(_a) {
    var children = _a.children, title = _a.title, description = _a.description;
    var _b = react_1.usePage().props, name = _b.name, quote = _b.quote;
    return (React.createElement("div", { className: "relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0" },
        React.createElement("div", { className: "relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r" },
            React.createElement("div", { className: "absolute inset-0 bg-zinc-900" }),
            React.createElement(react_1.Link, { href: routes_1.home(), className: "relative z-20 flex items-center text-lg font-medium" },
                React.createElement("img", { src: "/docset.png", alt: "Docset Logo", className: "mr-2 size-8" }),
                name),
            quote && (React.createElement("div", { className: "relative z-20 mt-auto" },
                React.createElement("blockquote", { className: "space-y-2" },
                    React.createElement("p", { className: "text-lg" },
                        "\u201C",
                        quote.message,
                        "\u201D"),
                    React.createElement("footer", { className: "text-sm text-neutral-300" }, quote.author))))),
        React.createElement("div", { className: "w-full lg:p-8" },
            React.createElement("div", { className: "mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]" },
                React.createElement(react_1.Link, { href: routes_1.home(), className: "relative z-20 flex items-center justify-center lg:hidden" },
                    React.createElement("img", { src: "/docset.png", alt: "Docset Logo", className: "h-10 sm:h-12" })),
                React.createElement("div", { className: "flex flex-col items-start gap-2 text-left sm:items-center sm:text-center" },
                    React.createElement("h1", { className: "text-xl font-medium" }, title),
                    React.createElement("p", { className: "text-sm text-balance text-muted-foreground" }, description)),
                children))));
}
exports["default"] = AuthSplitLayout;
