"use strict";
exports.__esModule = true;
exports.AppHeader = void 0;
var breadcrumbs_1 = require("@/components/breadcrumbs");
var icon_1 = require("@/components/icon");
var avatar_1 = require("@/components/ui/avatar");
var button_1 = require("@/components/ui/button");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var sheet_1 = require("@/components/ui/sheet");
var user_menu_content_1 = require("@/components/user-menu-content");
var use_initials_1 = require("@/hooks/use-initials");
var react_i18next_1 = require("react-i18next");
var utils_1 = require("@/lib/utils");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var app_logo_1 = require("./app-logo");
function AppHeader(_a) {
    var _b = _a.breadcrumbs, breadcrumbs = _b === void 0 ? [] : _b;
    var t = react_i18next_1.useTranslation().t;
    var page = react_1.usePage();
    var auth = page.props.auth;
    var getInitials = use_initials_1.useInitials();
    var _c = react_2.useState('pt'), locale = _c[0], setLocale = _c[1];
    react_2.useEffect(function () {
        var savedLocale = localStorage.getItem('selected-locale') || 'pt';
        setLocale(savedLocale);
    }, []);
    var mainNavItems = [
        {
            title: t('Reports'),
            href: "/" + locale + "/dashboard",
            icon: lucide_react_1.BarChart3
        },
        {
            title: t('Documents'),
            href: "/" + locale + "/documents",
            icon: lucide_react_1.FileText
        },
        {
            title: t('API'),
            href: "/" + locale + "/api",
            icon: lucide_react_1.Code2
        },
    ];
    var isActive = function (href) {
        if (!href)
            return false;
        var hrefString = typeof href === 'string' ? href : href.url;
        var resolvedHref = utils_1.resolveUrl(hrefString);
        return page.url === resolvedHref || page.url.startsWith(resolvedHref + '/');
    };
    return (React.createElement("header", { className: "sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" },
        React.createElement("div", { className: "border-b" },
            React.createElement("div", { className: "mx-auto flex h-12 sm:h-14 items-center px-3 sm:px-4 lg:px-6" },
                React.createElement("div", { className: "lg:hidden" },
                    React.createElement(sheet_1.Sheet, null,
                        React.createElement(sheet_1.SheetTrigger, { asChild: true },
                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "mr-1 sm:mr-2 h-9 w-9" },
                                React.createElement(lucide_react_1.Menu, { className: "h-5 w-5" }),
                                React.createElement("span", { className: "sr-only" }, "Menu"))),
                        React.createElement(sheet_1.SheetContent, { side: "left", className: "w-[280px] sm:w-72 p-0" },
                            React.createElement(sheet_1.SheetTitle, { className: "sr-only" }, "Menu de Navega\u00E7\u00E3o"),
                            React.createElement(sheet_1.SheetHeader, { className: "border-b p-4" },
                                React.createElement(react_1.Link, { href: "/" + locale + "/dashboard", className: "flex items-center gap-2" },
                                    React.createElement("img", { src: "/docset.png", alt: "Docset Logo", className: "h-6 w-6" }),
                                    React.createElement("span", { className: "font-semibold" }, "DocExtract"))),
                            React.createElement("nav", { className: "flex flex-col p-4 gap-1" }, mainNavItems.map(function (item) { return (React.createElement(react_1.Link, { key: item.title, href: item.href, className: utils_1.cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", isActive(item.href)
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground") },
                                item.icon && React.createElement(icon_1.Icon, { iconNode: item.icon, className: "h-5 w-5" }),
                                item.title)); })),
                            React.createElement("div", { className: "absolute bottom-0 left-0 right-0 border-t p-4" },
                                React.createElement(react_1.Link, { href: "/" + locale + "/documents/create" },
                                    React.createElement(button_1.Button, { className: "w-full gap-2" },
                                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                                        t('New Document'))))))),
                React.createElement(react_1.Link, { href: "/" + locale + "/dashboard", prefetch: true, className: "flex items-center gap-2 mr-3 sm:mr-4 lg:mr-6" },
                    React.createElement(app_logo_1["default"], null)),
                React.createElement("nav", { className: "hidden lg:flex items-center gap-1" }, mainNavItems.map(function (item) { return (React.createElement(react_1.Link, { key: item.title, href: item.href, className: utils_1.cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all", isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground") },
                    item.icon && React.createElement(icon_1.Icon, { iconNode: item.icon, className: "h-4 w-4" }),
                    item.title)); })),
                React.createElement("div", { className: "ml-auto flex items-center gap-1 sm:gap-2" },
                    React.createElement(react_1.Link, { href: "/" + locale + "/documents/create" },
                        React.createElement(button_1.Button, { size: "sm", className: "gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3" },
                            React.createElement(lucide_react_1.Plus, { className: "h-3.5 w-3.5 sm:h-4 sm:w-4" }),
                            React.createElement("span", { className: "hidden sm:inline text-xs sm:text-sm" }, t('New Document')))),
                    React.createElement(dropdown_menu_1.DropdownMenu, null,
                        React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                            React.createElement(button_1.Button, { variant: "ghost", className: "relative h-8 w-8 sm:h-9 sm:w-9 rounded-full" },
                                React.createElement(avatar_1.Avatar, { className: "h-8 w-8 sm:h-9 sm:w-9" },
                                    React.createElement(avatar_1.AvatarImage, { src: auth.user.avatar, alt: auth.user.name }),
                                    React.createElement(avatar_1.AvatarFallback, { className: "bg-primary/10 text-primary font-medium" }, getInitials(auth.user.name))))),
                        React.createElement(dropdown_menu_1.DropdownMenuContent, { className: "w-56", align: "end", forceMount: true },
                            React.createElement(user_menu_content_1.UserMenuContent, { user: auth.user })))))),
        breadcrumbs.length > 1 && (React.createElement("div", { className: "border-b bg-muted/30" },
            React.createElement("div", { className: "mx-auto flex h-9 sm:h-10 items-center px-3 sm:px-4 lg:px-6 overflow-x-auto" },
                React.createElement(breadcrumbs_1.Breadcrumbs, { breadcrumbs: breadcrumbs }))))));
}
exports.AppHeader = AppHeader;
