# scripts

Define object for communicate from libraries into MementoDatabase to BtcRelax system.

For productive recomended to use, quick files:
refreshAllPubs.js;
refreshPub.js;

Main documentation : http://wiki.mementodatabase.com/index.php/Memento_JavaScript_Library

For Library:
[S]Hosts - Add Entry action: SyncVersions()

[S]Points - Library action: SyncLybrary();
            Entry action: SetState();
            Trigger, after open: GetState();
            Trigger, after update: UpdatePoint();

[S]Products - Add Entry action: SetProductState()
              Add trigger after open: GetProductState()
