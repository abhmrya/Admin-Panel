const Helpers = {

    ready(callback) {

        if (
            document.readyState === "loading"
        ) {

            document.addEventListener(
                "DOMContentLoaded",
                callback
            );

        }

        else {

            callback();

        }

    }

};

window.Helpers = Object.freeze(Helpers);