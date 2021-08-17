<script>
  import { MDCDialog } from "@material/dialog";
  import { onMount, afterUpdate } from "svelte";
  import { ModalStore } from "../scripts/store";
  import { licenses } from "../scripts/licenses";
  let dialogElement;
  let dialog;

  onMount(() => {
    dialog = new MDCDialog(dialogElement);
    dialog.listen("MDCDialog:closing", function () {
      ModalStore.set(undefined);
    });
  });
  afterUpdate(() => {
    dialog.open();
  });
</script>

<style>
  .mdc-dialog .mdc-dialog__content,
  button {
    color: var(--body-color);
  }

  .mdc-dialog__surface {
    height: calc(100% - 144px);
    min-width: 94.2%;
    width: 856px;
    max-width: 856px;
  }

  hr {
    opacity: 0;
  }

  p {
    user-select: none;
  }

  .mdc-dialog__content {
  }
</style>

<div class="mdc-dialog" bind:this={dialogElement}>
  <div class="mdc-dialog__container">
    <div
      class="mdc-dialog__surface"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="my-dialog-title"
      aria-describedby="my-dialog-content">
      <div class="mdc-dialog__actions">
        <button
          type="button"
          class="mdc-button mdc-dialog__button"
          data-mdc-dialog-action="close">
          <div class="mdc-button__ripple" />
          <button
            class="material-icons mdc-top-app-bar__navigation-icon
            mdc-icon-button"
            aria-label="Open navigation menu">
            close
          </button>

        </button>
      </div>
      <div class="mdc-dialog__content" id="my-dialog-content">
        <h1>About</h1>

        <div style="overflow-y: auto;">

          <strong>Feedback:</strong>
          r.berg.2001@gmail.com
          <hr />

          <strong>Third party licences:</strong>

          {#each licenses as l (l)}
            <p >{l}</p>
            <hr />
          {/each}

        </div>

      </div>
    </div>
  </div>
  <div class="mdc-dialog__scrim" />
</div>
