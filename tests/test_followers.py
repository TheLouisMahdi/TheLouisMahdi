"""Verifiche del monitor follower, senza chiamate di rete."""

import unittest

from scripts.follower_monitor import genera_stato


class MonitorTest(unittest.TestCase):
    def setUp(self):
        self.a = {"id": 10, "login": "alfa"}
        self.b = {"id": 20, "login": "beta"}

    def test_prima_esecuzione_non_inventa_eventi(self):
        report = genera_stato(None, [self.a], [self.b], "2026-10-20T12:00:00Z")
        self.assertEqual(report["events"], [])
        self.assertEqual(len(report["followers"]), 1)

    def test_nuovo_follower(self):
        prima = genera_stato(None, [self.a], [], "t1")
        dopo = genera_stato(prima, [self.a, self.b], [], "t2")
        self.assertEqual([(e["kind"], e["login"]) for e in dopo["events"]], [("nuovo", "beta")])

    def test_follower_perso(self):
        prima = genera_stato(None, [self.a, self.b], [], "t1")
        dopo = genera_stato(prima, [self.a], [], "t2")
        self.assertEqual([(e["kind"], e["login"]) for e in dopo["events"]], [("perso", "beta")])

    def test_cambio_username_non_e_unfollow(self):
        prima = genera_stato(None, [self.a], [], "t1")
        dopo = genera_stato(prima, [{"id": 10, "login": "nuovo-nome"}], [], "t2")
        self.assertEqual(dopo["events"], [])

    def test_nessuna_modifica_non_aggiorna_data(self):
        prima = genera_stato(None, [self.a], [self.b], "t1")
        dopo = genera_stato(prima, [self.a], [self.b], "t2")
        self.assertEqual(dopo, prima)

    def test_segreti_e_azioni_non_fanno_parte_del_report(self):
        report = genera_stato(None, [self.a], [], "t1")
        self.assertEqual(set(report), {"version", "updated_at", "followers", "following", "events"})


if __name__ == "__main__":
    unittest.main()
