mergeInto(LibraryManager.library, {

    NotifyReady: function () {
        window.dispatchEvent(new CustomEvent("unity:ready"))
    },

    NotifyVictory: function () {
        window.dispatchEvent(new CustomEvent("unity:victory"))
    },

    NotifyDefeat: function () {
        window.dispatchEvent(new CustomEvent("unity:defeat"))
    }
})