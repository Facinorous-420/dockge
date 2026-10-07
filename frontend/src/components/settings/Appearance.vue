<template>
    <div>
        <div class="my-4">
            <label for="language" class="form-label">
                {{ $t("Language") }}
            </label>
            <select id="language" v-model="$root.language" class="form-select">
                <option
                    v-for="(lang, i) in $i18n.availableLocales"
                    :key="`Lang${i}`"
                    :value="lang"
                >
                    {{ $i18n.messages[lang].languageName }}
                </option>
            </select>
        </div>

        <template v-if="settingsLoaded">
            <!-- App Name -->
            <div class="my-4">
                <label for="appName" class="form-label">{{ $t("appName") }}</label>
                <input id="appName" v-model="settings.appName" type="text" class="form-control" maxlength="64" placeholder="Dockge" @change="saveSettings()" />
            </div>

            <!-- App Icon -->
            <div class="my-4">
                <label for="appIcon" class="form-label">{{ $t("appIcon") }}</label>
                <div class="d-flex align-items-center gap-3">
                    <img v-if="settings.appIcon" :src="settings.appIcon" class="app-icon-preview" alt="" />
                    <object v-else class="app-icon-preview" data="/icon.svg" />
                    <input id="appIcon" ref="appIconInput" type="file" accept="image/*" class="form-control" @change="onIconChange" />
                    <button v-if="settings.appIcon" class="btn btn-normal text-nowrap" type="button" @click="resetIcon">{{ $t("resetAppIcon") }}</button>
                </div>
                <div class="form-text">{{ $t("appIconHint") }}</div>
            </div>
        </template>

        <div v-show="true" class="my-4">
            <label for="timezone" class="form-label">{{ $t("Theme") }}</label>
            <div>
                <div
                    class="btn-group"
                    role="group"
                    aria-label="Basic checkbox toggle button group"
                >
                    <input
                        id="btncheck1"
                        v-model="$root.userTheme"
                        type="radio"
                        class="btn-check"
                        name="theme"
                        autocomplete="off"
                        value="light"
                    />
                    <label class="btn btn-outline-primary" for="btncheck1">
                        {{ $t("Light") }}
                    </label>

                    <input
                        id="btncheck2"
                        v-model="$root.userTheme"
                        type="radio"
                        class="btn-check"
                        name="theme"
                        autocomplete="off"
                        value="dark"
                    />
                    <label class="btn btn-outline-primary" for="btncheck2">
                        {{ $t("Dark") }}
                    </label>

                    <input
                        id="btncheck3"
                        v-model="$root.userTheme"
                        type="radio"
                        class="btn-check"
                        name="theme"
                        autocomplete="off"
                        value="auto"
                    />
                    <label class="btn btn-outline-primary" for="btncheck3">
                        {{ $t("Auto") }}
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const maxIconSize = 512 * 1024;

export default {
    computed: {
        settings() {
            return this.$parent.$parent.$parent.settings;
        },
        saveSettings() {
            return this.$parent.$parent.$parent.saveSettings;
        },
        settingsLoaded() {
            return this.$parent.$parent.$parent.settingsLoaded;
        },
    },

    methods: {
        /**
         * Read the chosen image as a data URL and save it as the app icon
         * @param {Event} event File input change event
         * @returns {void}
         */
        onIconChange(event) {
            const file = event.target.files[0];
            event.target.value = "";
            if (!file) {
                return;
            }
            if (file.size > maxIconSize) {
                this.$root.toastError("appIconTooLarge");
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                this.settings.appIcon = reader.result;
                this.saveSettings();
            };
            reader.readAsDataURL(file);
        },

        /**
         * Go back to the default Dockge icon
         * @returns {void}
         */
        resetIcon() {
            this.settings.appIcon = "";
            this.saveSettings();
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars.scss";

.btn-check:active + .btn-outline-primary,
.btn-check:checked + .btn-outline-primary,
.btn-check:hover + .btn-outline-primary {
    color: #fff;

    .dark & {
        color: #000;
    }
}

.app-icon-preview {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    object-fit: contain;
}

.dark {
    .list-group-item {
        background-color: $dark-bg2;
        color: $dark-font-color;
    }
}
</style>
