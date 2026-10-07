# CardioFamily POC — Presenter guide

About 8–10 minutes for both stories. Start from a fresh page load (or use
**Reset demo** in the sidebar). Everything shown is synthetic and runs on a
fixed demo date of **1 Oct 2026**.

Open with the banner: *Synthetic Data · Demonstration Environment · Not for
Clinical Use.* Every action carries a rule ID and "Demonstration only —
requires clinician review."

---

## Opening — Command Centre (1 min)

1. Land on **Command Centre**. Read the question: *"Who needs attention now?"*
2. Point to the attention queue: overdue items first (Thomas, Bram, **Pieter**,
   Claire), then a laboratory **reclassification awaiting impact review**,
   then upcoming and undated items.
3. Each row says **who**, **what**, **when** and a one-line **why**, with the
   demonstration rule ID.

> Message: one place that answers who in each family needs attention, and why.

---

## A. Family Action — "Did the action actually happen?" (4 min)

1. **Families → Janssens family.** The pedigree shows the family as a care
   unit: Sarah (proband, filled = phenotype recorded), Pieter and Lucas
   (vertical line = genotype positive, no phenotype), badges for open actions.
2. Click **Pieter** in the pedigree → **Open relative profile**.
   - **RISK:** *Genotype-positive / no phenotype recorded* (descriptive, not a
     risk estimate).
   - **NEXT ACTION:** *Surveillance review overdue — consider recall*, 93 days.
   - **GENETIC INTERPRETATION:** MYBPC3 SYN-VAR-001, Pathogenic; his cascade
     result.
3. Click the action. Walk **WHO / WHAT / WHEN / WHY**:
   - WHY cites the seeded surveillance plan; **View record** jumps to it.
   - RULE shows `DEMO-R-003`, version, plain-language trigger, "not clinically
     validated".
4. In **Workflow**, record **In progress** → **Return to Command Centre**:
   Pieter is still overdue but labelled *In progress*.
5. Open Pieter's row again, record **Completed** with a note (e.g. "Recall
   letter sent").
   - The outcome says the item is closed, **no new action is created and
     clinical care is unchanged**.
   - A short note explains that the source surveillance record still reflects
     the seeded clinical record; workflow completion does not alter clinical
     data.
6. **Open Pieter's profile:** *Action and review history* shows both entries;
   the surveillance table shows *Workflow item: Completed · source record
   unchanged*.
7. **Command Centre:** 13 outstanding, 3 overdue; Pieter has dropped off.

> Message: CardioFamily identifies care gaps **and** tracks whether the
> resulting action actually happened — with the reason and history visible.

---

## B. Reclassification Impact — "Whose care may need review?" (4 min)

1. From the Command Centre, open the **Peeters** reclassification row (or
   Families → Peeters → **Open impact review**).
2. **What changed:** last acknowledged classification **VUS** (2023) → latest
   laboratory classification **Likely pathogenic** (received 24 Sep 2026),
   *awaiting clinician review*. CardioFamily does not classify variants.
3. **Who may need attention:** pedigree with five relatives highlighted, then
   one row each:
   - **Maria, Hilde, Bram, Lotte** — first-degree relatives; cascade testing
     *would be* raised (`DEMO-R-001`); surveillance plans arranged under the
     previous classification may need review.
   - **Koen** (proband) — his result's interpretation changes; the VUS review
     item would no longer apply.
   - Not included: Jozef (deceased), Sofie (not a blood relative).
4. Point out that until now **nothing has changed**: the family is still
   derived from the last acknowledged classification.
5. In **Clinician review**, choose **Reviewed**, add a note, **Record
   decision**. The outcome message: workflow re-evaluated, four new items
   raised *for clinician review*, no test, plan or treatment changed.
6. **Return to Peeters family:** both classifications now read Likely
   pathogenic; *Who needs attention* lists cascade-testing considerations.
   Open **Koen**: RISK is now *Genotype-positive / phenotype-positive*; history
   shows the review.

> Message: when genetic knowledge changes, CardioFamily shows whose care may
> need review — and the clinician stays in control.

(Deferred and Not applicable are also supported; use Reviewed for the main
demo.)

---

## Optional — Relative Portal preview (1 min)

Sidebar → **Relative Portal preview.** Pieter's own view: his next step, test
result and screening dates in plain language, with no other relative's
information and no medical advice. If run after Story A, his next step reads
"nothing you need to do right now". **Return to clinician demo** goes back.

---

## Close

Return to the Command Centre: *"One cardiac genetic diagnosis should trigger
care for an entire family. CardioFamily closes the loop."*

Then use **Reset demo** (sidebar) to restore the starting state for the next
audience.

## Troubleshooting

- Counts look different from this guide → press **Reset demo** or reload.
- Opening a URL directly or reloading clears recorded decisions (in-memory
  demo state by design).
