package main

import (
	"TransferFile/config"
	"TransferFile/server"
	"os"
	"os/exec"
	"os/signal"
)

func main() {
	chChromeDie := make(chan struct{})
	chBackendDie := make(chan struct{})
	chSignal := listenToInterrupt()
	go server.Run()
	go startBrowser(chChromeDie, chBackendDie)
	for {
		select {
		case <-chSignal:
			print("adsf")
			chBackendDie <- struct{}{}
		case <-chChromeDie:
			print("5")
			os.Exit(0)
		}
	}
}

func startBrowser(chChromeDie chan struct{}, chBackendDie chan struct{}) {
	// 先写死路径，后面再照着 lorca 改
	chromePath := "C:\\Program Files（86）\\Google\\Chrome\\Application\\chrome.exe"
	cmd := exec.Command(chromePath, "--app=http://127.0.0.1:"+config.GetPort()+"/static/index.html")
	cmd.Start()
	go func() {
		<-chBackendDie
		print("3")
		cmd.Process.Kill()
	}()
	go func() {
		cmd.Wait()
		print("4")
		chChromeDie <- struct{}{}
	}()
}

func listenToInterrupt() chan os.Signal {
	chSignal := make(chan os.Signal, 1)
	signal.Notify(chSignal, os.Interrupt)
	return chSignal
}
